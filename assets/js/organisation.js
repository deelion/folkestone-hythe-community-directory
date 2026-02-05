const params = new URLSearchParams(window.location.search);
const orgName = params.get("org");

let allOrganisations = [];

fetch("/data/organisations.csv")
  .then((res) => res.text())
  .then((text) => {
    allOrganisations = parseCSV(text);
    const org = allOrganisations.find((o) => o["Organisation"] === orgName);
    if (org) {
      document.title = `${org["Organisation"]} | Folke.world`;
    }
    renderOrganisation(org, allOrganisations);
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

    if (matchingServices.length > 0) {
      renderServices(matchingServices);
    } else {
      const section = document.getElementById("ind-org-service-title");
      if (section) {
        section.remove();
      }
    }
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

function renderOrganisation(org) {
  const container = document.getElementById("org");

  if (!org) {
    container.innerHTML = "<p>Organisation not found.</p>";
    return;
  }

  container.innerHTML = `
  <div class="ind-org-page">
  ${renderOrgHeader(org)}

  <div class="org-card">
      ${renderOrgActions(org)}<br>
      ${org["Description"]}
    </div>
  </div>

          <div id="parent-org-section"></div>

  `;

  if (org["Parent"]) {
    const parentSection = document.getElementById("parent-org-section");

    parentSection.innerHTML = `
    <h4 class="parent-org-heading">Parent organisation(s)</h4>
    <div class="srv-org-grid" id="parent-org-grid"></div>
  `;

    const parentGrid = document.getElementById("parent-org-grid");

    // Reuse your existing card renderer
    renderOrganisationCards(org["Parent"], parentGrid);
  }
}

function renderServices(services) {
  if (!services || services.length === 0) return;

  const container = document.getElementById("services");

  services.forEach((service, index) => {
    const card = document.createElement("div");
    const encodedService = encodeURIComponent(service["Service"]);
    const avatarId = `avatars-${index}`;

    card.className = "ind-org-service-card";

    card.innerHTML = `
      <div class="ind-org-service-title">
        <h2>
          <span>
            <a href="/service/?service=${encodedService}">
              ${service["Service"]}
            </a>
          </span>
        </h2>
      </div>
    `;

    // <div class="ind-org-service-location">
    //     <p class="label">
    //       ${formatListSummary(service["Location(s)"])}
    //     </p>
    //   </div>

    container.appendChild(card);
  });
}

/* ---------- helpers ---------- */

function renderOrganisationCards(value, container) {
  if (!value || !container) return;

  const orgs = value
    .split(";")
    .map((o) => o.trim())
    .filter(Boolean);

  orgs.forEach((orgName) => {
    const encoded = encodeURIComponent(orgName);

    const card = document.createElement("a");
    card.href = `/organisation/?org=${encoded}`;
    card.className = "srv-org-card";
    card.setAttribute("aria-label", orgName);

    const avatar = document.createElement("div");
    avatar.className = "org-avatar";

    const img = new Image();
    img.src = `/assets/img/org-pp/${orgName}.jpg`;
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

function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function renderOrgHeader(org) {
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

  return `
    <section class="ind-org-header">
      ${renderOrgAvatar(org["Organisation"])}

      <div class="ind-org-header-details">
        <h1 class="ind-org-name">${org["Organisation"]}</h1>

        ${
          org["Org Type"]
            ? `<span class="ind-org-type-pill">${org["Org Type"]}</span>`
            : ""
        }

        ${socialLinks}
        
      </div>
    </section>
  `;
}

function renderOrgAvatar(orgName) {
  const safeName = orgName.replace(/\s+/g, "-").toLowerCase();
  const imgPath = `/assets/img/org-pp/${orgName}.jpg`;

  return `
    <div class="ind-org-avatar">
      <img
        src="${imgPath}"
        alt="${orgName}"
        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
      />
      <div class="ind-org-avatar-fallback">
        ${getInitials(orgName)}
      </div>
    </div>
  `;
}

function renderOrgActions(org) {
  let buttons = "";

  if (org["Volunteer URL"]) {
    buttons += `
      <a href="${org["Volunteer URL"]}" target="_blank" rel="noopener">
        <button class="ind-org-action-btn">Volunteer</button>
      </a>
    `;
  }

  if (org["Donate URL"]) {
    buttons += `
      <a href="${org["Donate URL"]}" target="_blank" rel="noopener">
        <button class="ind-org-action-btn secondary">Donate</button>
      </a>
    `;
  }

  return buttons ? `<div class="ind-org-actions">${buttons}</div>` : "";
}

function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

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

function renderUseCaseStickers(value, container, max = 3) {
  if (!value || !container) return;

  const cases = value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
    .slice(0, max);

  // available sticker positions
  const positions = [1, 2, 3];

  // shuffle positions
  positions.sort(() => Math.random() - 0.5);

  cases.forEach((useCase, index) => {
    const img = document.createElement("img");

    img.src = `/assets/img/stickers/${useCase}.png`;
    img.alt = useCase;

    const position = positions[index];

    img.className = `usecase-sticker sticker-${position}`;

    container.appendChild(img);
  });
}

function formatList(value) {
  if (!value) return "—";

  return value
    .split(";")
    .map((item) => item.trim())
    .join("<br />");
}

function formatListSummary(value) {
  if (!value) return "—";

  const items = value
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);

  if (items.length === 0) return "—";

  const first = items[0];
  const remaining = items.length - 1;

  const text =
    remaining > 0
      ? `${first} <span class="item-count">+${remaining}</span>`
      : first;

  return `
    <span class="inline-list">
      ${locationIcon()}
      <span class="text-bit">${text}</span>
    </span>
  `;
}

function formatOrganisationLinks(value) {
  if (!value) return "—";

  return value
    .split(";")
    .map((org) => {
      const name = org.trim();
      const encoded = encodeURIComponent(name);
      return `<a href="/organisation/?org=${encoded}">${name}</a>`;
    })
    .join("<br />");
}

function formatOrganisationImages(value) {
  if (!value) return "—";

  return value
    .split(";")
    .map((org) => {
      const name = org.trim();
      return `<span><img src = "/assets/img/org-pp/${name}.jpg" class = "pp"></span>`;
    })
    .join("");
}

function renderOrgAvatars(orgList, container) {
  container.innerHTML = "";

  const orgs = orgList
    ?.split(";")
    .map((o) => o.trim())
    .filter(Boolean);

  if (!orgs || orgs.length === 0) return;

  orgs.forEach((orgName) => {
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.title = orgName;

    const img = new Image();
    const safeName = orgName.replace(/\s+/g, "-").toLowerCase();
    img.src = `/assets/img/org-pp/${orgName}.jpg`;
    img.alt = orgName;

    img.onload = () => {
      avatar.appendChild(img);
    };

    img.onerror = () => {
      avatar.textContent = getInitials(orgName);
    };

    container.appendChild(avatar);
  });
}

function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatOrgSummary(value) {
  const orgs = parseOrgList(value);

  if (orgs.length === 0) return "—";

  const firstOrg = orgs[0];
  const remaining = orgs.length - 1;

  let summary = `
    <a href="/organisation/?org=${encodeURIComponent(firstOrg)}">
      ${firstOrg}
    </a>
  `;

  if (remaining > 0) {
    summary += ` <span class="org-count">+${remaining}</span>`;
  }

  return summary;
}

function parseOrgList(value) {
  return (
    value
      ?.split(";")
      .map((o) => o.trim())
      .filter(Boolean) || []
  );
}

function locationIcon() {
  return `
    <svg class="inline-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/>
    </svg>
  `;
}

const links = document.querySelectorAll(".nav-link");
links.forEach((link) => {
  if (link.href === window.location.href) {
    link.classList.add("active");
  }
});
