fetch("/data/services.csv")
  .then((res) => res.text())
  .then((text) => {
    const rows = text.trim().split("\n");
    const headers = rows[0].split(",").map((h) => h.trim());

    const data = rows.slice(1).map((row) => {
      const values = row.split(",");
      const obj = {};

      headers.forEach((header, i) => {
        obj[header] = values[i]?.trim() || "";
      });

      return obj;
    });

    renderServices(data);
  });

function renderServices(services) {
  const container = document.getElementById("services");

  services.forEach((service, index) => {
    const card = document.createElement("div");
    const encodedService = encodeURIComponent(service["Service"]);
    const avatarId = `avatars-${index}`;

    card.className = "service-card";

    card.innerHTML = `
      <div class="grid-top-block">
        <div class="org-row">
            <div id="${avatarId}" class="avatar-stack"></div>
            ${formatOrgSummary(service["Organisation(s)"])}
        </div>
      </div>

      <div class="grid-centre-text">
        <h2>
          <span>
            <a href="/service.html?service=${encodedService}">
              ${service["Service"]}
            </a>
          </span>
        </h2>
      </div>

      <div class="grid-bottom-block">
        <p class="label">
          ${formatListSummary(service["Location(s)"])}
        </p>
      </div>
    `;

    container.appendChild(card);

    const avatarContainer = document.getElementById(avatarId);
    renderOrgAvatars(service["Organisation(s)"], avatarContainer);
  });
}

/* ---------- helpers ---------- */

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
      return `<a href="/organisation.html?org=${encoded}">${name}</a>`;
    })
    .join("<br />");
}

function formatOrganisationImages(value) {
  if (!value) return "—";

  return value
    .split(";")
    .map((org) => {
      const name = org.trim();
      return `<span><img src = "/img/${name}.jpg" class = "pp"></span>`;
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
    img.src = `/img/${orgName}.jpg`;
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
    <a href="/organisation.html?org=${encodeURIComponent(firstOrg)}">
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
