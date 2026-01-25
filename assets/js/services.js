import { filterServices } from "./filters.js";

fetch("/data/services.csv")
  .then((res) => res.text())
  .then((text) => {
    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
    });

    if (parsed.errors.length) {
      console.error("CSV parse errors:", parsed.errors);
    }

    const data = parsed.data.map((row) => {
      const obj = {};
      Object.keys(row).forEach((key) => {
        obj[key.trim()] = row[key]?.trim?.() ?? row[key];
      });
      return obj;
    });

    const filtered = filterServices(data);

    filtered.sort((a, b) => {
      const nameA = a["Service"].toLowerCase();
      const nameB = b["Service"].toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });

    renderServices(filtered);
  });

function renderServices(services) {
  const container = document.getElementById("services");

  services.forEach((service, index) => {
    const card = document.createElement("div");
    const encodedService = encodeURIComponent(service["Service"]);
    const avatarId = `avatars-${index}`;
    const serviceUrl = `/service.html?service=${encodedService}`;

    card.className = "service-card";

    card.innerHTML = `
      <div class="usecase-stickers" id="stickers-${index}"></div>

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

    const stickerContainer = document.getElementById(`stickers-${index}`);
    renderUseCaseStickers(service["Use Cases"], stickerContainer, 3);

    card.addEventListener("click", () => {
      window.location.href = serviceUrl;
    });

    card.setAttribute("role", "link");
    card.setAttribute("tabindex", "0");

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        window.location.href = serviceUrl;
      }
    });
  });
}

/* ---------- helpers ---------- */

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
