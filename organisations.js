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
           <span class="icon">${websiteIcon()}</span>
         </a>`
      : "";

    const igLink = org["IG URL"]
      ? `<a href="${
          org["IG URL"]
        }" target="_blank" rel="noopener" aria-label="Instagram">
         <span class="icon">${instagramIcon()}</span>
       </a>`
      : "";

    const fbLink = org["FB URL"]
      ? `<a href="${
          org["FB URL"]
        }" target="_blank" rel="noopener" aria-label="Facebook">
         <span class="icon">${facebookIcon()}</span>
       </a>`
      : "";

    const socialLinks =
      website || igLink || fbLink
        ? `<div class="org-social-links">${website}${igLink}${fbLink}</div>`
        : "";

    const card = document.createElement("div");
    card.className = "orgs-card";

    card.innerHTML = `
      <h2>
        <a class="name" href="/organisation.html?org=${encodedName}">
          ${org["Organisation"]}
        </a>
      </h2>

      ${
        org["Org Type"]
          ? `<span class="ind-org-type-pill">${org["Org Type"]}</span>`
          : ""
      }

      ${socialLinks}
    `;

    container.appendChild(card);
  });
}

/* ---------- helpers ---------- */

function instagramIcon() {
  return `
    <i class="fa-brands fa-instagram"></i>
  `;
}

function facebookIcon() {
  return `
    <i class="fa-brands fa-facebook"></i>

  `;
}

function websiteIcon() {
  return `
    <i class="fa-solid fa-globe"></i>
  `;
}

const links = document.querySelectorAll(".nav-link");
links.forEach((link) => {
  if (link.href === window.location.href) {
    link.classList.add("active");
  }
});
