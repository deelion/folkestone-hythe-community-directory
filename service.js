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

function renderService(service) {
  const container = document.getElementById("service");

  if (!service) {
    container.innerHTML = "<p>Service not found.</p>";
    return;
  }

  container.innerHTML = `
  <div class="container">
    <div class="ind-service-card">
      <h1>${service["Service"]}</h1>

      ${formatLocationList(service["Location(s)"])}

      <div class="inline-list">
          ${calendarIcon()}
          <span class="text-bit">${formatList(service["Timing notes"])}</span>
        </div>

      <h4>Organisers</h4>
      <div class="srv-org-grid" id="srv-org-grid"></div>

      <div class="service-description">
      ${formatDescription(service["Description"])}
      </div>

      ${renderServiceURL(service["URL"])}

      </div>



    </div>

    
  `;

  const orgGrid = document.getElementById("srv-org-grid");
  renderOrganisationCards(service["Organisation(s)"], orgGrid);
}

/* ---------- helpers ---------- */

function calendarIcon() {
  return `
    <svg
      class="inline-icon"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1zm12 8H5v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9zM5 8h14V7a1 1 0 0 0-1-1h-1v1a1 1 0 1 1-2 0V6H8v1a1 1 0 1 1-2 0V6H5a1 1 0 0 0-1 1v1z"/>
    </svg>
  `;
}

function formatLocationList(value) {
  if (!value) return "—";

  const items = value
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);

  if (items.length === 0) return "—";

  return items
    .map(
      (item) => `
        <div class="inline-list">
          ${locationIcon()}
          <span class="text-bit">${item}</span>
        </div>
      `
    )
    .join("");
}

function locationIcon() {
  return `
    <svg class="inline-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/>
    </svg>
  `;
}

function formatDescription(text) {
  if (!text) return "";

  return text
    .split(/\n\s*\n/) // split on blank lines
    .map((p) => `<p>${p.trim()}</p>`)
    .join("");
}

function renderServiceURL(url) {
  if (!url) return "";

  const trimmed = url.trim();

  // Basic safety check
  if (!trimmed.startsWith("http")) return "";

  return `
    <div class="service-link">
      <a href="${trimmed}" target="_blank" rel="noopener">
        <button>More information on organiser’s website</button>
      </a>
    </div>
  `;
}

function renderOrganisationCards(value, container) {
  if (!value || !container) return;

  const orgs = value
    .split(";")
    .map((o) => o.trim())
    .filter(Boolean);

  orgs.forEach((orgName) => {
    const encoded = encodeURIComponent(orgName);

    const card = document.createElement("a");
    card.href = `/organisation.html?org=${encoded}`;
    card.className = "srv-org-card";
    card.setAttribute("aria-label", orgName);

    const avatar = document.createElement("div");
    avatar.className = "org-avatar";

    const img = new Image();
    img.src = `/img/${orgName}.jpg`;
    img.alt = orgName;

    img.onload = () => avatar.appendChild(img);
    img.onerror = () => {
      avatar.textContent = getInitials(orgName);
    };

    const name = document.createElement("div");
    name.className = "org-name";
    name.textContent = orgName;

    card.appendChild(avatar);
    card.appendChild(name);
    container.appendChild(card);
  });
}

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

function getInitials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
