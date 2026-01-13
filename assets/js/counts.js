document.addEventListener("DOMContentLoaded", () => {
  updateHomepageCounts();
});

function updateHomepageCounts() {
  Promise.all([
    fetch("/data/services.csv").then((res) => res.text()),
    fetch("/data/organisations.csv").then((res) => res.text()),
  ]).then(([servicesText, orgsText]) => {
    const services = parseCSV(servicesText);
    const organisations = parseCSV(orgsText);

    // Apply existing filters
    const filteredServices = filterServicesByUseCase(services);

    // Count services
    const serviceCount = filteredServices.length;

    // Find organisations that run at least one filtered service
    const orgSet = new Set();

    filteredServices.forEach((service) => {
      const orgs = service["Organisation(s)"]
        ?.split(";")
        .map((o) => o.trim())
        .filter(Boolean);

      orgs?.forEach((org) => orgSet.add(org));
    });

    const organisationCount = orgSet.size;

    // Update DOM
    const serviceEl = document.getElementById("service-count");
    const orgEl = document.getElementById("organisation-count");

    if (serviceEl) serviceEl.textContent = serviceCount;
    if (orgEl) orgEl.textContent = organisationCount;
  });
}

function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentValue = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"' && nextChar === '"') {
      // Escaped quote
      currentValue += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      currentRow.push(currentValue);
      currentValue = "";
    } else if (char === "\n" && !inQuotes) {
      currentRow.push(currentValue);
      rows.push(currentRow);
      currentRow = [];
      currentValue = "";
    } else {
      currentValue += char;
    }
  }

  // Push last value
  currentRow.push(currentValue);
  rows.push(currentRow);

  const headers = rows[0].map((h) => h.trim());

  return rows.slice(1).map((row) => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i]?.trim() || "";
    });
    return obj;
  });
}
