const loading = document.getElementById("loading");

const FEED_URL =
  "https://raw.githubusercontent.com/deelion/folkestone-hythe-community-feed/refs/heads/main/public/feed.xml";

fetch(FEED_URL)
  .then((res) => res.text())
  .then((xmlText) => {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, "text/xml");

    const items = Array.from(xml.getElementsByTagName("item")).slice(0, 25);
    const list = document.getElementById("feed");

    items.forEach((item) => {
      const title = item.querySelector("title")?.textContent;
      const link = item.querySelector("link")?.textContent;
      // const org = item.querySelector("organisation").textContent;
      const description = item.querySelector("description")?.textContent;
      const pubDate =
        item.querySelector("pubDate")?.textContent ||
        item.querySelector("date")?.textContent ||
        "";

      const li = document.createElement("li");
      li.innerHTML = `
        <h3><strong></strong><a href="${link}">${title}</a></h3>
        <small>${pubDate ? new Date(pubDate).toLocaleDateString() : ""}</small>
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
