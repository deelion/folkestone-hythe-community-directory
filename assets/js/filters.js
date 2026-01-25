/* ==============================
   Filter configuration
   ============================== */

// filters.js

// main source of truth for use cases
// filters.js

export const FILTER_DICTIONARIES = {
  useCases: {
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
  },

  professionalReferral: {
    label: "Professional referral",
    serviceField: "Referrals Only",
    type: "secondary",
    kind: "boolean",
  },

  homelessnessSupport: {
    label: "Homelessness support",
    serviceField: "Homeless Only",
    type: "secondary",
    kind: "boolean",
  },

  parentingSupport: {
    label: "Parenting support",
    serviceField: "Children/Parents Only",
    type: "secondary",
    kind: "boolean",
  },

  disabilitySupport: {
    label: "Disability support",
    serviceField: "Disability Only",
    type: "secondary",
    kind: "boolean",
  },

  // ageGroups: {
  //   children: "children",
  //   teens: "teens (13–17)",
  //   adults: "adults",
  //   seniors: "older adults (65+)",
  //   "all-ages": "all ages",
  // },

  // areas: {
  //   north: "North side",
  //   south: "South side",
  //   central: "Central",
  //   surrounding: "Surrounding towns",
  // },

  // supportNeeds: {
  //   homelessness: "support for homelessness",
  //   disability: "disability support",
  //   "mental-health": "mental health support",
  //   "domestic-violence": "domestic violence support",
  //   "food-insecurity": "food insecurity",
  // },
};

export const FILTER_CONFIG = {
  useCases: {
    label: "Use cases",
    serviceField: "Use Cases",
    dictionary: FILTER_DICTIONARIES.useCases,
    type: "primary",
    multi: false,
    defaultValue: [],
  },

  professionalReferral: {
    label: "Professional referral",
    serviceField: "Referrals Only",
    type: "secondary",
    kind: "boolean",
    defaultValue: "exclude",
  },

  homelessnessSupport: {
    label: "Homelessness support",
    serviceField: "Homeless Only",
    type: "secondary",
    kind: "boolean",
    defaultValue: "include",
  },

  parentingSupport: {
    label: "Parenting support",
    serviceField: "Children/Parents Only",
    type: "secondary",
    kind: "boolean",
    defaultValue: "include",
  },

  disabilitySupport: {
    label: "Disability support",
    serviceField: "Disability Only",
    type: "secondary",
    kind: "boolean",
    defaultValue: "include",
  },

  // ageGroups: {
  //   label: "Age",
  //   serviceField: "Age Groups",
  //   dictionary: FILTER_DICTIONARIES.ageGroups,
  // },

  // areas: {
  //   label: "Area",
  //   serviceField: "Areas Served",
  //   dictionary: FILTER_DICTIONARIES.areas,
  // },

  // supportNeeds: {
  //   label: "Support needs",
  //   serviceField: "Support Needs",
  //   dictionary: FILTER_DICTIONARIES.supportNeeds,
  // },
};

// const useCasesDict = {
//   "free-activities": "find free activities", //27
//   "meet-people": "meet new people", // 22
//   "get-outside": "get outside more", // 20
//   "save-money": "save money", // 17
//   "new-hobbies": "discover new hobbies", // 14
//   "reduce-waste": "help reduce waste", // 10
//   "free-food": "find free food", //9
//   "safe-space": "have a safe place to go", // 8
//   "locally-grown": "find locally grown food", // 5
//   "spend-local": "spend local", // 3
// };

const FILTER_STORAGE_KEY = "activeFilters";

const DEFAULT_FILTERS = Object.fromEntries(
  Object.entries(FILTER_CONFIG).map(([key, config]) => [
    key,
    config.defaultValue,
  ]),
);

export function filterServices(services) {
  const activeFilters = getActiveFilters();

  return services.filter((service) => {
    return Object.entries(activeFilters).every(([filterKey, activeValue]) => {
      return serviceMatchesFilterGroup(service, filterKey, activeValue);
    });
  });
}

/* ==============================
   Filter state helpers
   ============================== */

export function getActiveFilters() {
  return {
    ...DEFAULT_FILTERS,
    ...(JSON.parse(localStorage.getItem(FILTER_STORAGE_KEY)) || {}),
  };
}

export function setActiveFilters(filters) {
  localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
}

export function clearFilters() {
  setActiveFilters(DEFAULT_FILTERS);
}

export function updateFilter(filterKey, values) {
  const filters = getActiveFilters();

  setActiveFilters({
    ...filters,
    [filterKey]: values,
  });
}

/* ==============================
   Data helpers
   ============================== */

// function parseUseCases(value) {
//   return (
//     value
//       ?.split(",")
//       .map((v) => v.trim())
//       .filter(Boolean) || []
//   );
// }

function parseMultiValueField(value) {
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

// function filterServicesByUseCase(services) {
//   const filters = getActiveFilters();

//   if (!filters.useCases.length) return services;

//   return services.filter((service) => {
//     const serviceUseCases = parseUseCases(service["Use Cases"]);

//     return filters.useCases.some((filter) => serviceUseCases.includes(filter));
//   });
// }

// function serviceMatchesFilterGroup(service, filterKey, activeValues) {
//   if (!activeValues.length) return true;

//   const { serviceField } = FILTER_CONFIG[filterKey];
//   const serviceValues = parseMultiValueField(service[serviceField]);

//   return activeValues.some((value) => serviceValues.includes(value));
// }

function serviceMatchesFilterGroup(service, filterKey, activeValue) {
  const config = FILTER_CONFIG[filterKey];
  if (!config) return true;

  // 🔹 Boolean filter (professional referral)
  if (config.kind === "boolean") {
    const raw = service[config.serviceField];
    const isReferralOnly = String(raw).toUpperCase() === "TRUE";

    // default: exclude referral-only services
    if (activeValue === "exclude") {
      return !isReferralOnly;
    }

    if (activeValue === "only") {
      return isReferralOnly;
    }

    // include = show everything
    return true;
  }

  // 🔹 Standard multi-value filters
  if (!activeValue.length) return true;

  const serviceValues = parseMultiValueField(service[config.serviceField]);

  return activeValue.some((value) => serviceValues.includes(value));
}
