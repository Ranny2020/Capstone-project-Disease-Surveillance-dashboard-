// Backend API URL - default to same origin so deployed backend + frontend work together
const API_URL = (typeof window !== 'undefined' && window.__API_URL__) ? window.__API_URL__ : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

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

document.addEventListener('DOMContentLoaded', () => {
  renderDonutChart();
});
