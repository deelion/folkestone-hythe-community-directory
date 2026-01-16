const { builder } = require("@netlify/functions");
const Parser = require("rss-parser");
const RSS = require("rss");

exports.config = {
  schedule: "0 */1 * * *", // every hour
};

exports.handler = builder(async function (event, context) {
  const siteURL = process.env.URL;
  const path = "/community-feed.xml";

  const parser = new Parser({
    headers: { "User-Agent": "Mozilla/5.0 (compatible; NetlifyRSS/1.0)" },
    customFields: { item: ["content:encoded"] },
  });

  const orgCSV = await fetch(`${siteURL}/data/organisations.csv`).then((res) =>
    res.text()
  );
  const organisations = parseCSV(orgCSV);

  const rssSources = organisations
    .filter((org) => org["RSS Feed"])
    .map((org) => ({ name: org["Organisation"], rssUrl: org["RSS Feed"] }));

  const items = [];

  for (const source of rssSources) {
    try {
      const feed = await parser.parseURL(source.rssUrl);
      feed.items.forEach((item) => {
        items.push({
          title: item.title,
          link: item.link,
          date: item.isoDate || item.pubDate,
          description:
            item["content:encoded"] ||
            item.contentSnippet ||
            item.content ||
            "",
          organisation: source.name,
        });
      });
    } catch (err) {
      console.warn(`RSS failed: ${source.rssUrl}`, err.message);
    }
  }

  items.sort((a, b) => new Date(b.date) - new Date(a.date));
  const latestItems = items.slice(0, 100);

  const feed = new RSS({
    title: "Local Community Updates",
    description: "Updates from local community organisations",
    site_url: siteURL,
    feed_url: `${siteURL}/community-feed.xml`,
    language: "en",
  });

  latestItems.forEach((item) => {
    feed.item({
      title: item.title,
      description: item.description,
      url: item.link,
      guid: item.link,
      date: item.date,
    });
  });

  const xml = feed.xml({ indent: true });

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/rss+xml",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
    body: xml,
    path,
  };
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
