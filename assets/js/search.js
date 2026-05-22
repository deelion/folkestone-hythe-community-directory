let organisationsData = [];
let servicesData = [];

Promise.all([
  fetch("/data/organisations.csv").then((res) => res.text()),
  fetch("/data/services.csv").then((res) => res.text()),
]).then(([orgText, serviceText]) => {
  let organisations = parseCSV(orgText);
  const services = parseCSV(serviceText);

  // exclude national orgs
  organisations = organisations.filter(
    (org) => org["Operation Area"]?.trim().toLowerCase() !== "national",
  );

  organisations.sort((a, b) => {
    const nameA = a["Organisation"].toLowerCase();
    const nameB = b["Organisation"].toLowerCase();
    return nameA.localeCompare(nameB);
  });

  // Store globally
  organisationsData = organisations;
  servicesData = services;

  // Optional initial render
  renderSearchResults([]);
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

function searchDirectory(query) {
  const searchTerm = query.trim().toLowerCase();

  if (!searchTerm) return [];

  const searchWords = searchTerm.split(/\s+/); // split query into words

  function matchesAllWords(text) {
    const lowerText = text.toLowerCase();
    // Return true only if every search word is in the text somewhere
    return searchWords.every((word) => lowerText.includes(word));
  }

  function getScore(text) {
    const lowerText = text.toLowerCase();
    if (lowerText === searchTerm) return 3; // exact full match
    if (lowerText.startsWith(searchTerm)) return 2; // starts with
    if (matchesAllWords(lowerText)) return 1; // all words included
    return 0; // no match
  }

  // Organisations
  const organisationResults = organisationsData
    .filter((org) => matchesAllWords(org["Organisation"] || ""))
    .map((org) => ({
      type: "organisation",
      name: org["Organisation"],
      data: org,
      score: getScore(org["Organisation"]),
    }));

  // Services
  const serviceResults = servicesData
    .filter((service) => matchesAllWords(service["Service"] || ""))
    .map((service) => ({
      type: "service",
      name: service["Service"],
      data: service,
      score: getScore(service["Service"]),
    }));

  // Merge, sort by score descending, then limit
  return [...organisationResults, ...serviceResults]
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, 10);
}

const searchInput = document.getElementById("directorySearch");
const indexFilter = document.querySelector(".index-filter"); // your nav buttons container
const searchResults = document.getElementById("searchResults");

// search bar positioning mobile
function isMobile() {
  return /Mobi|Android/i.test(navigator.userAgent);
}

searchInput.addEventListener("input", (e) => {
  const query = e.target.value;
  const results = searchDirectory(query);

  renderSearchResults(results, query);

  // Show/hide index-filter based on whether input is blank
  if (query.trim()) {
    indexFilter.style.display = "none"; // hide when query is not blank
    searchResults.style.display = "";
  } else {
    indexFilter.style.display = ""; // show again (default)
    searchResults.style.display = "none";
  }

  if (!isMobile()) return; // only for mobile

  // Use setTimeout to wait until keyboard shows up
  setTimeout(() => {
    searchInput.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 300); // 300ms gives time for keyboard to appear
});

function renderSearchResults(results, query = "") {
  const container = document.getElementById("searchResults");

  // If the input is blank, just clear results
  if (!query.trim()) {
    container.innerHTML = "";
    container.classList.remove("active");
    return;
  }

  container.classList.add("active"); // show container

  if (!results.length) {
    container.innerHTML = "<p>No results found</p>";
    return;
  }

  container.innerHTML = results
    .map((result) => {
      const url =
        result.type === "organisation"
          ? `/organisation/?org=${encodeURIComponent(result.name)}`
          : `/service/?service=${encodeURIComponent(result.name)}`;

      return `
      <a href = "${url}">
      <div class="search-result">
          <div class="result-type">
            ${result.type === "organisation" ? "Organisation" : "Service"}
          </div>

          <div class="result-name">
            ${result.name}
          </div>
        </div>
        </a>
      `;
    })
    .join("");
}

window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    // true if coming from bfcache (back-forward cache)
    const searchInput = document.getElementById("directorySearch");
    if (searchInput) {
      searchInput.value = "";
      renderSearchResults([], "");
    }

    const indexFilter = document.querySelector(".index-filter");
    if (indexFilter) indexFilter.style.display = "";
  }
});

window.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("directorySearch");
  if (searchInput) {
    searchInput.value = ""; // clear input
    renderSearchResults([], ""); // clear results container too
  }

  // Also make sure the index filter shows
  const indexFilter = document.querySelector(".index-filter");
  if (indexFilter) indexFilter.style.display = "";
});
