const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = process.env.PORT || 3000;
const dataFile = path.join(__dirname, 'data', 'users.json');
const dbFile = path.join(__dirname, 'data', 'users.db');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

async function ensureDataFile() {
  try {
    await fs.access(dataFile);
  } catch (err) {
    await fs.mkdir(path.dirname(dataFile), { recursive: true });
    await fs.writeFile(dataFile, '[]', 'utf8');
  }
}

let db;

async function initDb() {
  await fs.mkdir(path.dirname(dbFile), { recursive: true });
  db = new sqlite3.Database(dbFile);
  await new Promise((resolve, reject) => {
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        fullName TEXT,
        email TEXT UNIQUE,
        phone TEXT,
        organization TEXT,
        role TEXT,
        state TEXT,
        passwordHash TEXT,
        createdAt TEXT
      )`,
      (err) => (err ? reject(err) : resolve())
    );
  });

  // Migrate any existing JSON users into the DB (no-op if already migrated)
  try {
    const contents = await fs.readFile(dataFile, 'utf8');
    const users = JSON.parse(contents || '[]');
    const insert = db.prepare(`INSERT OR IGNORE INTO users (id, fullName, email, phone, organization, role, state, passwordHash, createdAt) VALUES (?,?,?,?,?,?,?,?,?)`);
    users.forEach((u) => {
      insert.run(u.id, u.fullName, u.email, u.phone, u.organization || '', u.role || '', u.state || '', u.passwordHash || '', u.createdAt || new Date().toISOString());
    });
    insert.finalize();
  } catch (e) {
    // ignore migration errors
  }
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function readUsers() {
  // return all users from sqlite db
  if (!db) await initDb();
  return await new Promise((resolve, reject) => {
    db.all('SELECT * FROM users', (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

async function writeUsers(users) {
  // legacy helper - also update JSON file for compatibility
  await fs.writeFile(dataFile, JSON.stringify(users, null, 2), 'utf8');
  if (!db) await initDb();
  const insert = db.prepare(`INSERT OR REPLACE INTO users (id, fullName, email, phone, organization, role, state, passwordHash, createdAt) VALUES (?,?,?,?,?,?,?,?,?)`);
  users.forEach((u) => {
    insert.run(u.id, u.fullName, u.email, u.phone, u.organization || '', u.role || '', u.state || '', u.passwordHash || '', u.createdAt || new Date().toISOString());
  });
  insert.finalize();
}

app.post('/api/signup', async (req, res) => {
  const { fullName, email, password, confirmPassword, phone, organization, role, state, terms } = req.body;

  if (!fullName || !email || !password || !confirmPassword || !phone || !role || !state || !terms) {
    return res.status(400).json({ message: 'All required fields must be completed.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  if (!db) await initDb();

  // check existing
  const exists = await new Promise((resolve, reject) => {
    db.get('SELECT 1 FROM users WHERE email = ?', [normalizedEmail], (err, row) => {
      if (err) return reject(err);
      resolve(!!row);
    });
  });

  if (exists) {
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }

  const newUser = {
    id: crypto.randomUUID(),
    fullName: fullName.trim(),
    email: normalizedEmail,
    phone: phone.trim(),
    organization: (organization || '').trim(),
    role: role.trim(),
    state: state.trim(),
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString()
  };

  await new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO users (id, fullName, email, phone, organization, role, state, passwordHash, createdAt) VALUES (?,?,?,?,?,?,?,?,?)`,
      [newUser.id, newUser.fullName, newUser.email, newUser.phone, newUser.organization, newUser.role, newUser.state, newUser.passwordHash, newUser.createdAt],
      (err) => (err ? reject(err) : resolve())
    );
  });

  // Also append to JSON file for backwards compatibility
  try {
    const users = await readUsers();
    await writeUsers(users);
  } catch (e) {
    // ignore
  }

  res.status(201).json({ message: 'Account created successfully.' });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  if (!db) await initDb();

  const user = await new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE email = ?', [normalizedEmail], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });

  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  res.json({ message: 'Login successful.' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`HealthWatch backend running on port ${port}`);
});
