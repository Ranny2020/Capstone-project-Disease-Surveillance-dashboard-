const defaultReports = [
  {
    id: "NCDC-LF-W30-2026",
    disease: "Lassa Fever",
    location: "Multiple state / LGAs",
    by: "NCDC/ State surveillance system",
    date: "week 30, 2026",
    status: "Confirmed cases reported",
    action: "NCDC / State response activities"
  },
  {
    id: "NCDC-MEAS-W30-2026",
    disease: "Measles",
    location: "Multiple state / LGAs",
    by: "NCDC/ State surveillance system",
    date: "week 30, 2026",
    status: "Confirmed cases reported",
    action: "Surveillance and outbreak response"
  },
  {
    id: "NCDC-CHOL-W32-2026",
    disease: "Cholera",
    location: "Multiple state / LGAs",
    by: "NCDC/ State surveillance system",
    date: "week 32, 2026",
    status: "Cases reported",
    action: "Cholera surveillance and response"
  },
  {
    id: "NCDC-COVID-W34-2026",
    disease: "COVID 19",
    location: "Nigeria",
    by: "NCDC/ State surveillance system",
    date: "week 34, 2026",
    status: "Reported",
    action: "Surveillance & Monitoring"
  }
];

const key = 'healthwatchReports';
const reports = JSON.parse(localStorage.getItem(key) || 'null') || defaultReports;

const rows = document.querySelector("#rows");
const mobileCards = document.querySelector("#mobileCards");
const count = document.querySelector("#count");
const diseaseSelect = document.querySelector("#disease");
const stateSelect = document.querySelector("#state");
const searchInputs = Array.from(document.querySelectorAll("#search, #searchSecondary"));

function saveReports(list) {
  localStorage.setItem(key, JSON.stringify(list));
}

function populateFilters() {
  if (!diseaseSelect) return;

  const diseases = [...new Set(reports.map(report => report.disease))];
  diseaseSelect.innerHTML = [
    '<option value="All Disease">All Disease</option>',
    ...diseases.map(disease => `<option value="${disease}">${disease}</option>`)
  ].join('');

  if (!stateSelect) return;

  const states = [...new Set(reports.map(report => report.location))];
  stateSelect.innerHTML = [
    '<option value="All States">All States</option>',
    ...states.map(state => `<option value="${state}">${state}</option>`)
  ].join('');
}

function render(data) {
  rows.innerHTML = "";

  if (data.length === 0) {
    rows.innerHTML = `
      <tr>
        <td colspan="7" class="no-results">No reports found</td>
      </tr>
    `;
    count.textContent = "Showing 0 reports";
    return;
  }

  data.forEach(report => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${report.id}</td>
      <td>${report.disease}</td>
      <td>${report.location}</td>
      <td>${report.by}</td>
      <td>${report.date}</td>
      <td>${report.status}</td>
      <td>${report.action}</td>
    `;
    rows.appendChild(tr);
  });

  count.textContent = `Showing 1 to ${data.length} of ${data.length} reports`;
}

function filterReports() {
  const search = searchInputs
    .map(input => input.value.trim().toLowerCase())
    .filter(Boolean)
    .join(' ');

  const disease = diseaseSelect ? diseaseSelect.value : 'All Disease';
  const state = stateSelect ? stateSelect.value : 'All States';

  const filtered = reports.filter(report => {
    const searchable = Object.values(report).join(' ').toLowerCase();
    const matchesSearch = search === '' || searchable.includes(search);
    const matchesDisease = disease === 'All Disease' || report.disease === disease;
    const matchesState = state === 'All States' || report.location === state;

    return matchesSearch && matchesDisease && matchesState;
  });

  render(filtered);
}

searchInputs.forEach(input => {
  input.addEventListener('input', () => {
    searchInputs.forEach(field => {
      if (field !== input) field.value = input.value;
    });
    filterReports();
  });
});

document.querySelector("#disease")?.addEventListener("change", filterReports);
document.querySelector("#state")?.addEventListener("change", filterReports);
document.querySelector("#filterBtn")?.addEventListener("click", filterReports);


// Sidebar
const sidebar =
  document.querySelector("#sidebar");

const overlay =
  document.querySelector("#overlay");

document.querySelector("#menuBtn").onclick = () => {
  sidebar.classList.add("open");
  overlay.classList.add("show");
};

overlay.onclick = () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
};


// Add report modal
const modal =
  document.querySelector("#modal");

document.querySelector("#addBtn").onclick = () => {
  modal.classList.add("show");
};

document.querySelector("#close").onclick = () => {
  modal.classList.remove("show");
};

modal.addEventListener("click", event => {
  if (event.target === modal) {
    modal.classList.remove("show");
  }
});

document.querySelector("#form").addEventListener("submit", event => {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);

  const disease = formData.get('disease')?.toString().trim();
  const location = formData.get('location')?.toString().trim();
  const reportedBy = formData.get('reportedBy')?.toString().trim();
  const dateReported = formData.get('dateReported')?.toString().trim();
  const status = formData.get('status')?.toString().trim() || 'Reported';
  const action = formData.get('action')?.toString().trim();

  if (!disease || !location || !reportedBy || !dateReported || !action) {
    alert('Please complete all report fields.');
    return;
  }

  const newReport = {
    id: `NCDC-${disease.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`,
    disease,
    location,
    by: reportedBy,
    date: dateReported,
    status,
    action
  };

  const nextReports = [newReport, ...reports];
  reports.splice(0, reports.length, ...nextReports);
  saveReports(reports);
  populateFilters();
  render(reports);
  form.reset();
  modal.classList.remove("show");
  alert("Report saved successfully.");
});


populateFilters();
render(reports);
