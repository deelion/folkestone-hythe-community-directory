fetch("/data/organisations.csv")
  .then((res) => res.text())
  .then((text) => {
    let organisations = parseCSV(text);

    organisations.sort((a, b) => {
      const nameA = a["Organisation"].toLowerCase();
      const nameB = b["Organisation"].toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });

    renderOrganisations(organisations);
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

function renderOrganisations(orgs) {
  const container = document.getElementById("organisations");

  orgs.forEach((org) => {
    const encodedName = encodeURIComponent(org["Organisation"]);

    const website = org["Org Website"]
      ? `<a href="${
          org["Org Website"]
        }" target="_blank" rel="noopener" aria-label="Website">
           ${websiteIcon()}
         </a>`
      : "";

    const ig = org["IG URL"]
      ? `<a href="${
          org["IG URL"]
        }" target="_blank" rel="noopener" aria-label="Instagram">
           ${instagramIcon()}
         </a>`
      : "";

    const fb = org["FB URL"]
      ? `<a href="${
          org["FB URL"]
        }" target="_blank" rel="noopener" aria-label="Facebook">
           ${facebookIcon()}
         </a>`
      : "";

    const socialLinks =
      ig || fb || website
        ? `<div class="orgs-social-links">${ig}${fb}${website}</div>`
        : "";

    const card = document.createElement("div");
    card.className = "orgs-card";

    card.innerHTML = `
      <h2>
        <a class="name" href="/organisation.html?org=${encodedName}">
          ${org["Organisation"]}
        </a>
      </h2>

      <h5>${org["Org Type"]}</h5>

      ${socialLinks}
    `;

    container.appendChild(card);
  });
}

/* ---------- helpers ---------- */

function instagramIcon() {
  return `
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm0 1.8a2.7 2.7 0 1 1 0 5.4 2.7 2.7 0 0 1 0-5.4z"/>
    </svg>
  `;
}

function facebookIcon() {
  return `
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H8v-2.9h2.4V9.6c0-2.4 1.4-3.7 3.6-3.7 1 0 2 .2 2 .2v2.3h-1.1c-1.1 0-1.4.7-1.4 1.4v1.7H16l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z"/>
    </svg>
  `;
}

function websiteIcon() {
  return `
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10
               10-4.48 10-10S17.52 2 12 2zm0 18
               c-4.41 0-8-3.59-8-8s3.59-8 8-8
               8 3.59 8 8-3.59 8-8 8zm1-13h-2v2h2V7zm0 4h-2v6h2v-6z"/>
    </svg>
  `;
}

const links = document.querySelectorAll(".nav-link");
links.forEach((link) => {
  if (link.href === window.location.href) {
    link.classList.add("active");
  }
});
