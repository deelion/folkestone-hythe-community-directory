const loading = document.getElementById("loading");

const FEED_URL =
  "https://raw.githubusercontent.com/deelion/folkestone-hythe-community-feed/refs/heads/main/public/feed.xml";

fetch(FEED_URL)
  .then((res) => res.text())
  .then((xmlText) => {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, "text/xml");

    const items = Array.from(xml.getElementsByTagName("item")).slice(0, 100);
    const list = document.getElementById("feed");

    items.forEach((item) => {
      const title = item.querySelector("title")?.textContent;
      const link = item.querySelector("link")?.textContent;
      const org = item.querySelector("organisation").textContent;
      const description = item.querySelector("description")?.textContent;
      const pubDate =
        item.querySelector("pubDate")?.textContent ||
        item.querySelector("date")?.textContent ||
        "";

      const li = document.createElement("li");
      li.innerHTML = `
      <div class="feed-item-header">
      <div class="feed-item-header-left">
      ${renderOrgAvatar(org)}
      <div class="feed-org-name">${org}</div>
      <div class="feed-org-date"><small>${pubDate ? new Date(pubDate).toLocaleDateString() : ""}</small></div>
      </div>
      </div>
        <h2><a href="${link}">${title}</a></h2>
        <div>${description}</div>
      `;

      list.appendChild(li);
    });
  })
  .catch((err) => {
    console.error("Failed to load feed", err);
    loading.textContent = "Failed to load updates.";
  })
  .finally(() => {
    loading.style.display = "none";
  });

function renderOrgAvatar(orgName) {
  const safeName = orgName.replace(/\s+/g, "-").toLowerCase();
  const imgPath = `/assets/img/org-pp/${orgName}.jpg`;

  return `
    <div class="feed-org-avatar">
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

function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
