const loading = document.getElementById("loading");

// !! remove full path when tested
const FEED_URL = "/community-feed.xml";

fetch(FEED_URL)
  .then((res) => res.text())
  .then((xmlText) => {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, "text/xml");

    const items = Array.from(xml.getElementsByTagName("item"));
    const list = document.getElementById("feed");

    items.forEach((item) => {
      const title = item.querySelector("title")?.textContent;
      const link = item.querySelector("link")?.textContent;
      const description = item.querySelector("description")?.textContent;
      const pubDate =
        item.querySelector("pubDate")?.textContent ||
        item.querySelector("date")?.textContent ||
        "";

      const li = document.createElement("li");
      li.innerHTML = `
        <h3><a href="${link}">${title}</a></h3>
        <small>${pubDate ? new Date(pubDate).toLocaleDateString() : ""}</small>
        <div>${description}</div>
      `;

      list.appendChild(li);

      loading.style.display = "none";
    });
  })
  .catch((err) => {
    console.error("Failed to load feed", err);
    loading.textContent = "Failed to load updates.";
  });
