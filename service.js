const params = new URLSearchParams(window.location.search);
const serviceName = params.get("service");

fetch("/data/services.csv")
  .then((res) => res.text())
  .then((text) => {
    const services = parseCSV(text);
    const service = services.find((s) => s["Service"] === serviceName);
    renderService(service);
  });

function parseCSV(text) {
  const rows = text.trim().split("\n");
  const headers = rows[0].split(",").map((h) => h.trim());

  return rows.slice(1).map((row) => {
    const values = row.split(",");
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = values[i]?.trim() || "";
    });
    return obj;
  });
}

function renderService(service) {
  const container = document.getElementById("service");

  if (!service) {
    container.innerHTML = "<p>Service not found.</p>";
    return;
  }

  container.innerHTML = `
    <div class="service-card">
      <h1>${service["Service"]}</h1>

      <p>
        <span class="label">Organisations:</span><br />
        ${formatOrganisationLinks(service["Organisation(s)"])}
      </p>

      <p>
        <span class="label">Locations:</span><br />
        ${formatList(service["Location(s)"])}
      </p>
    </div>
  `;
}

/* ---------- helpers ---------- */

function formatOrganisationLinks(value) {
  if (!value) return "—";

  return value
    .split(";")
    .map((org) => {
      const name = org.trim();
      const encoded = encodeURIComponent(name);
      return `<a href="/organisation.html?org=${encoded}">${name}</a>`;
    })
    .join("<br />");
}

function formatList(value) {
  if (!value) return "—";

  return value
    .split(";")
    .map((item) => item.trim())
    .join("<br />");
}
