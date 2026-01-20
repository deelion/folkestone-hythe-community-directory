/* ==============================
   Filter configuration
   ============================== */

// filters.js

// main source of truth for use cases
const useCasesDict = {
  "free-activities": "find free activities", //27
  "meet-people": "meet new people", // 22
  "get-outside": "get outside more", // 20
  "save-money": "save money", // 17
  "new-hobbies": "discover new hobbies", // 14
  "reduce-waste": "help reduce waste", // 10
  "free-food": "find free food", //9
  "safe-space": "have a safe place to go", // 8
  "locally-grown": "find locally grown food", // 5
  "spend-local": "spend local", // 3
};

// const USE_CASE_FILTERS = {
//   "save-money": {
//     label: "save money",
//   },
//   "reduce-waste": {
//     label: "help reduce waste",
//   },
//   "meet-people": {
//     label: "meet new people",
//   },
//   "free-activities": {
//     label: "find free activities",
//   },
// };

const FILTER_STORAGE_KEY = "activeFilters";

/* ==============================
   Filter state helpers
   ============================== */

function getActiveFilters() {
  return (
    JSON.parse(localStorage.getItem(FILTER_STORAGE_KEY)) || {
      useCases: [],
    }
  );
}

function setActiveFilters(filters) {
  localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
}

function clearFilters() {
  setActiveFilters({ useCases: [] });
}

/* ==============================
   Data helpers
   ============================== */

function parseUseCases(value) {
  return (
    value
      ?.split(",")
      .map((v) => v.trim())
      .filter(Boolean) || []
  );
}

/* ==============================
   Filtering logic
   ============================== */

function filterServicesByUseCase(services) {
  const filters = getActiveFilters();

  if (!filters.useCases.length) return services;

  return services.filter((service) => {
    const serviceUseCases = parseUseCases(service["Use Cases"]);

    return filters.useCases.some((filter) => serviceUseCases.includes(filter));
  });
}
