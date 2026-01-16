// testing
// export const config = {
//   schedule: "0 */3 * * *", // every 3 hours
// };

// export default async () => {
//   return new Response(JSON.stringify({ status: "ok" }), {
//     headers: { "Content-Type": "application/json" },
//   });
// };

// const siteURL = process.env.URL; // production site URL

// const orgCSV = await fetch(`${siteURL}/data/organisations.csv`)
//   .then(res => res.text());

// const organisations = parseCSV(orgCSV);

import Parser from "rss-parser";
import RSS from "rss";

export const config = {
  schedule: "0 */1 * * *", // every 1 hours
};

export default async () => {
  const siteURL = process.env.URL;
  const parser = new Parser({
    headers: { "User-Agent": "Mozilla/5.0 (compatible; NetlifyRSS/1.0)" },
  });

  // 1. Load organisations CSV
  const orgCSV = await fetch(`${siteURL}/data/organisations.csv`).then((res) =>
    res.text()
  );

  const organisations = parseCSV(orgCSV);

  // 2. Extract RSS URLs
  const rssSources = organisations
    .filter((org) => org["RSS Feed"])
    .map((org) => ({
      name: org["Organisation"],
      rssUrl: org["RSS Feed"],
    }));

  // 3. Fetch & normalize RSS items
  const items = [];

  for (const source of rssSources) {
    try {
      const feed = await parser.parseURL(source.rssUrl);

      feed.items.forEach((item) => {
        items.push({
          title: item.title,
          link: item.link,
          date: item.isoDate || item.pubDate,
          description: item.contentSnippet || item.content || "",
          organisation: source.name,
        });
      });
    } catch (err) {
      console.warn(`RSS failed: ${source.rssUrl}`, err.message);
    }
  }

  // Sort newest first
  items.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Optional limit
  const latestItems = items.slice(0, 100);

  // 4. 👉 Generate RSS (THIS is where the rss library goes)
  const feed = new RSS({
    title: "Local Community Updates",
    description: "Updates from local community organisations",
    site_url: siteURL,
    feed_url: `${siteURL}/.netlify/functions/updateUnifiedFeed`,
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

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
};

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

// extract rss urls
// const rssSources = organisations
//   .filter(org =>
//     org["RSS URL"] &&
//     org["Operation Area"]?.trim().toLowerCase() !== "national"
//   )
//   .map(org => ({
//     name: org["Organisation"],
//     rssUrl: org["RSS URL"]
//   }));

// import Parser from "rss-parser";
// const parser = new Parser();

// const allItems = [];

// for (const source of rssSources) {
//   try {
//     const feed = await parser.parseURL(source.rssUrl);

//     feed.items.forEach(item => {
//       allItems.push({
//         title: item.title,
//         link: item.link,
//         date: item.isoDate || item.pubDate,
//         organisation: source.name,
//         source: source.rssUrl
//       });
//     });
//   } catch (err) {
//     console.warn(`Failed RSS: ${source.rssUrl}`, err.message);
//   }
// }

// allItems.sort((a, b) => {
//   return new Date(b.date) - new Date(a.date);
// });

// const unifiedFeed = allItems.slice(0, 100);

// import RSS from "rss";

// const feed = new RSS({
//   title: "Local Community Updates",
//   description: "Aggregated updates from local community organisations",
//   feed_url: `${siteURL}/.netlify/functions/unifiedFeed`,
//   site_url: siteURL,
//   language: "en"
// });

// items.forEach(item => {
//   feed.item({
//     title: item.title,
//     description: item.description || "",
//     url: item.link,
//     guid: item.link,
//     date: item.date
//   });
// });

// const xml = feed.xml({ indent: true });
