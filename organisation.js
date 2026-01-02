const params = new URLSearchParams(window.location.search);
const orgName = params.get("org");

// Load org info
fetch("/data/organisations.csv")
  .then((res) => res.text())
  .then((text) => {
    const orgs = parseCSV(text);
    const org = orgs.find((o) => o["Organisation"] === orgName);
    renderOrganisation(org);
  });

// Load services for this org
fetch("/data/services.csv")
  .then((res) => res.text())
  .then((text) => {
    const services = parseCSV(text);

    const matchingServices = services.filter((service) => {
      const orgs = service["Organisation(s)"]?.split(";").map((o) => o.trim());

      return orgs?.includes(orgName);
    });

    renderServices(matchingServices);
  });

/* ---------- helpers ---------- */

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

function renderOrganisation(org) {
  const container = document.getElementById("org");

  if (!org) {
    container.innerHTML = "<p>Organisation not found.</p>";
    return;
  }

  const igLink = org["IG URL"]
    ? `<a href="${
        org["IG URL"]
      }" target="_blank" rel="noopener" aria-label="Instagram">
         ${instagramIcon()}
       </a>`
    : "";

  const fbLink = org["FB URL"]
    ? `<a href="${
        org["FB URL"]
      }" target="_blank" rel="noopener" aria-label="Facebook">
         ${facebookIcon()}
       </a>`
    : "";

  const socialLinks =
    igLink || fbLink
      ? `<div class="org-social-links">${igLink}${fbLink}</div>`
      : "";

  container.innerHTML = `
    <div class="org-card">
      <h1>${org["Organisation"]}</h1>
      <h5>${org["Org Type"]}</h5>
      <p><strong>Operates in:</strong> ${org["Operation Area"]}</p>

      <p>
        <a href="${org["Org Website"]}" target="_blank" rel="noopener">
          Visit website
        </a>
      </p>

      ${socialLinks}
    </div>
  `;
}

function instagramIcon() {
  return `
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm0 1.8a2.7 2.7 0 1 1 0 5.4 2.7 2.7 0 0 1 0-5.4zM17.8 6.2a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
    </svg>
  `;
}

function facebookIcon() {
  return `
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H8v-2.9h2.4V9.6c0-2.4 1.4-3.7 3.6-3.7 1 0 2 .2 2 .2v2.3h-1.1c-1.1 0-1.4.7-1.4 1.4v1.7H16l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z"/>
    </svg>
  `;
}

function renderServices(services) {
  const list = document.getElementById("services");

  if (services.length === 0) {
    list.innerHTML = "<li>No services listed.</li>";
    return;
  }

  services.forEach((service) => {
    const li = document.createElement("li");
    const encodedService = encodeURIComponent(service["Service"]);
    li.innerHTML = `<a href="/service.html?service=${encodedService}">${service["Service"]}</a>`;
    list.appendChild(li);
  });
}
