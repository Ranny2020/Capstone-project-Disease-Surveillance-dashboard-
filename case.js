const reports = [
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

const rows = document.querySelector("#rows");
const mobileCards = document.querySelector("#mobileCards");
const count = document.querySelector("#count");

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

  const search =
    document.querySelector("#search")
      .value
      .trim()
      .toLowerCase();

  const disease =
    document.querySelector("#disease").value;

  const state =
    document.querySelector("#state").value;

  const filtered = reports.filter(report => {

    const searchable =
      Object.values(report)
        .join(" ")
        .toLowerCase();

    const matchesSearch =
      search === "" ||
      searchable.includes(search);

    const matchesDisease =
      disease === "All Disease" ||
      report.disease === disease;

    const matchesState =
      state === "All States" ||
      report.location === state;

    return (
      matchesSearch &&
      matchesDisease &&
      matchesState
    );
  });

  render(filtered);
}


// Search updates immediately as the user types.
document
  .querySelector("#search")
  .addEventListener("input", filterReports);

document
  .querySelector("#disease")
  .addEventListener("change", filterReports);

document
  .querySelector("#state")
  .addEventListener("change", filterReports);

document
  .querySelector("#filterBtn")
  .addEventListener("click", filterReports);


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
  alert("Report saved successfully.");
  modal.classList.remove("show");
});


// Initial state: ALL reports are displayed.
render(reports);
