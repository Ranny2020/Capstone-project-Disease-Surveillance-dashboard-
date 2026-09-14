// Backend API URL - default to your Render deployment; can be overridden with `window.__API_URL__`
const API_URL = (typeof window !== 'undefined' && window.__API_URL__) ? window.__API_URL__ : 'https://capstone-project-disease-surveillance.onrender.com';
const buttons = document.querySelectorAll('button.primary-button, button.secondary-button');

buttons.forEach((button) => {
  if (button.type === 'submit' && button.closest('form')) {
    return;
  }

  button.addEventListener('click', () => {
    const message = button.classList.contains('secondary-button')
      ? 'Thanks for your interest! Learn more is coming soon.'
      : 'Action received.';
    window.alert(message);
  });
});

const drawerToggle = document.getElementById('drawerToggle');
const sidebarDrawer = document.querySelector('.sidebar-drawer');
const drawerClose = document.querySelector('.drawer-close');
const drawerLinks = document.querySelectorAll('.drawer-link');

if (drawerToggle && sidebarDrawer && drawerClose) {
  const closeDrawer = () => {
    sidebarDrawer.classList.remove('open');
    sidebarDrawer.setAttribute('aria-hidden', 'true');
  };

  drawerToggle.addEventListener('click', () => {
    sidebarDrawer.classList.add('open');
    sidebarDrawer.setAttribute('aria-hidden', 'false');
  });

  drawerClose.addEventListener('click', closeDrawer);

  drawerLinks.forEach((link) => {
    link.addEventListener('click', closeDrawer);
  });
}

// Dashboard search: filter tables and stat cards
(function setupDashboardSearch(){
  const searchInput = document.querySelector('.search-box input');
  if (!searchInput) return;

  function normalize(s){ return (s||'').toString().toLowerCase(); }

  function applySearch(){
    const q = normalize(searchInput.value).trim();

    // filter table rows
    const tables = document.querySelectorAll('.dashboard-main .table-card table');
    tables.forEach(table => {
      const tbody = table.tBodies[0];
      if (!tbody) return;
      Array.from(tbody.rows).forEach(row => {
        const rowText = normalize(row.textContent);
        row.style.display = q === '' || rowText.includes(q) ? '' : 'none';
      });
    });

    // filter stat cards
    const stats = document.querySelectorAll('.dashboard-main .stat-card');
    stats.forEach(card => {
      const text = normalize(card.textContent);
      card.style.display = q === '' || text.includes(q) ? '' : 'none';
    });
  }

  searchInput.addEventListener('input', applySearch);
})();

function showAuthMessage(message, isError = false) {
  const title = isError ? 'Error' : 'Success';
  window.alert(`${title}: ${message}`);
}

function getStoredUser() {
  try {
    const rawUser = localStorage.getItem('healthwatchUser');
    return rawUser ? JSON.parse(rawUser) : null;
  } catch (error) {
    return null;
  }
}

function saveStoredUser(user) {
  if (!user) return;
  const safeUser = {
    id: user.id || '',
    fullName: user.fullName || user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    organization: user.organization || '',
    role: user.role || 'Health Officer',
    state: user.state || '',
    createdAt: user.createdAt || new Date().toISOString()
  };
  localStorage.setItem('healthwatchUser', JSON.stringify(safeUser));
}

function hydrateUserProfile() {
  const user = getStoredUser();
  if (!user) return;

  const fullName = user.fullName || 'User';
  const role = user.role || 'Health Officer';
  const email = user.email || '';
  const phone = user.phone || '';
  const state = user.state || '';

  document.querySelectorAll('.user-name').forEach((el) => {
    el.textContent = fullName;
  });

  document.querySelectorAll('.profile-name').forEach((el) => {
    el.textContent = fullName;
  });

  document.querySelectorAll('.profile-role, .role, .user-role').forEach((el) => {
    el.textContent = role;
  });

  document.querySelectorAll('.profile-email, .email').forEach((el) => {
    el.textContent = email;
  });

  document.querySelectorAll('.user-avatar').forEach((el) => {
    const initials = fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
    el.textContent = initials || 'U';
  });

  const fullNameInput = document.querySelector('input[name="fullName"]');
  if (fullNameInput) fullNameInput.value = fullName;

  const emailInput = document.querySelector('input[name="email"]');
  if (emailInput) emailInput.value = email;

  const phoneInput = document.querySelector('input[name="phone"]');
  if (phoneInput) phoneInput.value = phone;

  const stateInput = document.querySelector('input[name="state"]');
  if (stateInput) stateInput.value = state;

  const profileSummary = document.querySelector('.profile-card h2');
  if (profileSummary) profileSummary.textContent = fullName;

  const roleSummary = document.querySelector('.profile-card .role');
  if (roleSummary) roleSummary.textContent = role;

  const emailSummary = document.querySelector('.profile-card .email');
  if (emailSummary) emailSummary.textContent = email;
}

async function handleSignupForm() {
  const signupForm = document.getElementById('signupForm');
  if (!signupForm) return;

  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(signupForm);
    const payload = {
      fullName: formData.get('fullName')?.toString().trim(),
      email: formData.get('email')?.toString().trim(),
      phone: formData.get('phone')?.toString().trim(),
      organization: formData.get('organization')?.toString().trim(),
      role: formData.get('role')?.toString().trim(),
      state: formData.get('state')?.toString().trim(),
      password: formData.get('password')?.toString(),
      confirmPassword: formData.get('confirmPassword')?.toString(),
      terms: formData.get('terms') === 'on'
    };

    try {
      const response = await fetch(`${API_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) {
        showAuthMessage(result.message || 'Signup failed.', true);
        return;
      }

      const signedUpUser = {
        id: result.user?.id || '',
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        organization: payload.organization,
        role: payload.role,
        state: payload.state,
        createdAt: new Date().toISOString()
      };

      saveStoredUser(signedUpUser);
      showAuthMessage(result.message || 'Account created successfully.');
      window.location.href = 'login.html';
    } catch (error) {
      showAuthMessage('Unable to reach the server. Please try again.', true);
    }
  });
}

async function handleLoginForm() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(loginForm);
    const payload = {
      email: formData.get('email')?.toString().trim(),
      password: formData.get('password')?.toString()
    };

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) {
        showAuthMessage(result.message || 'Login failed.', true);
        return;
      }

      const signedInUser = result.user || getStoredUser() || {
        fullName: payload.email.split('@')[0].replace(/[._-]/g, ' '),
        email: payload.email,
        role: 'Health Officer'
      };

      saveStoredUser(signedInUser);
      showAuthMessage(result.message || 'Login successful.');
      window.location.href = 'dashboard.html';
    } catch (error) {
      showAuthMessage('Unable to reach the server. Please try again.', true);
    }
  });
}

handleSignupForm();
handleLoginForm();

// Render donut chart for gender distribution
function renderDonutChart(){
  const donut = document.querySelector('.donut-chart');
  if (!donut) return;

  const male = Number(donut.dataset.male || 0);
  const female = Number(donut.dataset.female || 0);
  const total = male + female || 1;
  const malePercent = Math.round((male/total) * 1000) / 10; // one decimal
  const maleDeg = (male/total) * 360;

  // Colors match Figma: gold for male, deep blue for female
  const maleColor = '#f2b01e';
  const femaleColor = '#2e328f';

  // Apply conic-gradient background
  donut.style.background = `conic-gradient(${maleColor} 0 ${maleDeg}deg, ${femaleColor} ${maleDeg}deg 360deg)`;

  // Update center and legend values if present
  const centerTotal = donut.querySelector('.donut-total');
  if (centerTotal) centerTotal.textContent = total.toLocaleString();

  const legendValues = document.querySelectorAll('.legend-value');
  if (legendValues && legendValues.length >= 2) {
    legendValues[0].textContent = male.toLocaleString();
    legendValues[1].textContent = female.toLocaleString();
  }

  const legendPercents = document.querySelectorAll('.legend-percent');
  if (legendPercents && legendPercents.length >= 2) {
    legendPercents[0].textContent = `[${malePercent}%]`;
    legendPercents[1].textContent = `[${Math.round(1000 - malePercent*10)/10}%]`;
  }
}

const defaultFacilities = [
  { name: 'Nassarawa General Hospital, Kano', state: 'Kano State', phone: '+234 7012345678', active: true },
  { name: 'Aminu Kano Teaching Hospital, Kano', state: 'Kano State', phone: '+234 7012345678', active: true },
  { name: 'Lagos State University Teaching Hospital (LASUTH)', state: 'Lagos State', phone: '+234 7012345678', active: true },
  { name: 'General Hospital, Kawo Kaduna', state: 'Kaduna State', phone: '+234 7012345678', active: true },
  { name: 'Asokoro District Hospital', state: 'FCT, Abuja', phone: '+234 7012345678', active: true },
  { name: 'Nnamdi Azikiwe University Teaching Hospital', state: 'Anambra State', phone: '+234 7012345678', active: true },
  { name: 'University of Nigeria Teaching Hospital (UNTH)', state: 'Enugu State', phone: '+234 7012345678', active: true },
  { name: 'General Hospital, Lafia', state: 'Nasarawa State', phone: '+234 7012345678', active: true }
];

function getFacilities() {
  try {
    const saved = JSON.parse(localStorage.getItem('healthwatchFacilities') || 'null');
    if (Array.isArray(saved) && saved.length) return saved;
  } catch (error) {
    // ignore malformed storage and fall back to defaults
  }

  localStorage.setItem('healthwatchFacilities', JSON.stringify(defaultFacilities));
  return defaultFacilities;
}

function saveFacilities(facilities) {
  localStorage.setItem('healthwatchFacilities', JSON.stringify(facilities));
}

function renderFacilities() {
  const list = document.querySelector('.facility-list');
  if (!list) return;

  const facilities = getFacilities();
  list.innerHTML = facilities.map((facility) => `
    <div class="facility-item">
      <div class="facility-avatar">+</div>
      <div class="facility-info">
        <div class="facility-name">${facility.name}</div>
        <div class="facility-sub">${facility.state}</div>
      </div>
      <div class="facility-phone">${facility.phone}</div>
      <div class="facility-meta">
        <span class="status-badge ${facility.active !== false ? 'active' : ''}">${facility.active !== false ? 'Active' : 'Inactive'}</span>
        <button class="edit-btn" aria-label="Edit facility">✎</button>
      </div>
    </div>
  `).join('');
}

function setupFacilityForm() {
  const modal = document.getElementById('facilityModal');
  const addBtn = document.getElementById('addFacilityBtn');
  const closeBtn = document.getElementById('closeFacilityModal');
  const cancelBtn = document.getElementById('cancelFacilityModal');
  const form = document.getElementById('facilityForm');

  if (!modal || !addBtn || !closeBtn || !cancelBtn || !form) return;

  const openModal = () => modal.classList.remove('hidden');
  const closeModal = () => {
    modal.classList.add('hidden');
    form.reset();
  };

  addBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const facilityName = (formData.get('facilityName') || '').toString().trim();
    const facilityState = (formData.get('facilityState') || '').toString().trim();
    const facilityPhone = (formData.get('facilityPhone') || '').toString().trim();

    if (!facilityName || !facilityState || !facilityPhone) {
      alert('Please complete all facility fields before saving.');
      return;
    }

    const facilities = getFacilities();
    facilities.unshift({
      name: facilityName,
      state: facilityState,
      phone: facilityPhone,
      active: true
    });

    saveFacilities(facilities);
    renderFacilities();
    setupFacilitiesEdit();
    closeModal();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  hydrateUserProfile();
  renderFacilities();
  renderDonutChart();
  setupFacilityForm();
});

// Inline edit handler for health facilities list
function setupFacilitiesEdit() {
  const list = document.querySelector('.facility-list');
  if (!list) return;

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('.edit-btn');
    if (!btn) return;
    const item = btn.closest('.facility-item');
    if (!item || item.classList.contains('editing')) return;
    item.classList.add('editing');

    const nameEl = item.querySelector('.facility-name');
    const subEl = item.querySelector('.facility-sub');
    const phoneEl = item.querySelector('.facility-phone');
    const meta = item.querySelector('.facility-meta');

    const original = {
      name: nameEl ? nameEl.textContent : '',
      sub: subEl ? subEl.textContent : '',
      phone: phoneEl ? phoneEl.textContent : ''
    };

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'edit-name';
    nameInput.value = original.name;

    const subInput = document.createElement('input');
    subInput.type = 'text';
    subInput.className = 'edit-sub';
    subInput.value = original.sub;

    const phoneInput = document.createElement('input');
    phoneInput.type = 'text';
    phoneInput.className = 'edit-phone';
    phoneInput.value = original.phone;

    if (nameEl) nameEl.replaceWith(nameInput);
    if (subEl) subEl.replaceWith(subInput);
    if (phoneEl) phoneEl.replaceWith(phoneInput);

    // hide edit button while editing
    btn.style.display = 'none';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-btn primary-button';
    saveBtn.type = 'button';
    saveBtn.textContent = 'Save';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-btn secondary-button';
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'Cancel';

    const controls = document.createElement('div');
    controls.className = 'edit-controls';
    controls.appendChild(saveBtn);
    controls.appendChild(cancelBtn);
    meta.appendChild(controls);

    saveBtn.addEventListener('click', () => {
      const newName = nameInput.value.trim() || original.name;
      const newSub = subInput.value.trim() || original.sub;
      const newPhone = phoneInput.value.trim() || original.phone;

      const nameDiv = document.createElement('div');
      nameDiv.className = 'facility-name';
      nameDiv.textContent = newName;

      const subDiv = document.createElement('div');
      subDiv.className = 'facility-sub';
      subDiv.textContent = newSub;

      const phoneDiv = document.createElement('div');
      phoneDiv.className = 'facility-phone';
      phoneDiv.textContent = newPhone;

      nameInput.replaceWith(nameDiv);
      subInput.replaceWith(subDiv);
      phoneInput.replaceWith(phoneDiv);

      controls.remove();
      btn.style.display = '';
      item.classList.remove('editing');

      // Optional: send update to backend here
    });

    cancelBtn.addEventListener('click', () => {
      const nameDiv = document.createElement('div');
      nameDiv.className = 'facility-name';
      nameDiv.textContent = original.name;

      const subDiv = document.createElement('div');
      subDiv.className = 'facility-sub';
      subDiv.textContent = original.sub;

      const phoneDiv = document.createElement('div');
      phoneDiv.className = 'facility-phone';
      phoneDiv.textContent = original.phone;

      nameInput.replaceWith(nameDiv);
      subInput.replaceWith(subDiv);
      phoneInput.replaceWith(phoneDiv);

      controls.remove();
      btn.style.display = '';
      item.classList.remove('editing');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupFacilitiesEdit();
});

// Open external info pages when an Info badge is clicked
function setupInfoBadges() {
  document.addEventListener('click', (e) => {
    const badge = e.target.closest('.badge.info');
    if (!badge) return;
    const url = badge.getAttribute('data-info-url');
    if (!url) return;
    // open in a new tab
    window.open(url, '_blank', 'noopener');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupInfoBadges();
});
