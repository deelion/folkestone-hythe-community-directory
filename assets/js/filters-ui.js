import {
  FILTER_DICTIONARIES,
  FILTER_CONFIG,
  getActiveFilters,
  updateFilter,
  clearFilters,
} from "./filters.js";

document.addEventListener("DOMContentLoaded", () => {
  const panel = document.getElementById("filter-panel");
  if (!panel) return;

  const buttonsContainer = panel.querySelector(".filter-buttons");
  if (!buttonsContainer) return;

  const toggle = document.querySelector(".secondary-filter-toggle");
  const secondaryFilters = document.getElementById("secondary-filters");

  if (toggle && secondaryFilters) {
    toggle.addEventListener("click", (e) => {
      e.preventDefault();

      const isCollapsed = secondaryFilters.classList.contains(
        "secondary-filters--collapsed",
      );

      secondaryFilters.classList.toggle("secondary-filters--collapsed");
      toggle.setAttribute("aria-expanded", String(isCollapsed));
    });
  }

  // Clear any existing buttons
  //   buttonsContainer.innerHTML = "";
  buttonsContainer
    .querySelectorAll(".filter-btn")
    .forEach((btn) => btn.remove());

  Object.entries(FILTER_DICTIONARIES.useCases).forEach(([key, label]) => {
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.dataset.usecase = key;
    btn.textContent = label;

    // check if already active
    const filters = getActiveFilters();
    if (filters.useCases.includes(key)) btn.classList.add("active");

    btn.addEventListener("click", () => {
      updateFilter("useCases", [key]);
      window.location.href = "/services";
    });

    buttonsContainer.appendChild(btn);
  });

  //   moveActiveFilterNextToAll(buttonsContainer);

  const BOOLEAN_LABELS = {
    exclude: "Exclude",
    include: "Include",
    only: "Only",
  };

  function renderFilterPills() {
    const container = document.getElementById("secondary-filters");
    if (!container) return;

    container.innerHTML = "";

    const filters = getActiveFilters();

    Object.entries(FILTER_CONFIG).forEach(([key, config]) => {
      if (config.type !== "secondary") return;

      // 🔹 Boolean filter pill
      if (config.kind === "boolean") {
        const value = filters[key] || config.defaultValue;
        const isDefault = value === config.defaultValue;

        const pill = document.createElement("div");
        pill.className = "filter-pill";
        pill.dataset.isDefault = String(isDefault);

        pill.innerHTML = `
        <button type="button" aria-haspopup="listbox">
          <span class="pill-label">${config.label}:</span>
          <span class="pill-value">${BOOLEAN_LABELS[value]}</span>
          <i class="fa-solid fa-chevron-down"></i>
        </button>

        <div class="filter-dropdown hidden">
          ${Object.entries(BOOLEAN_LABELS)
            .map(
              ([option, label]) =>
                `<button data-value="${option}">${label}</button>`,
            )
            .join("")}
        </div>
      `;

        const toggleBtn = pill.querySelector("button");
        const dropdown = pill.querySelector(".filter-dropdown");

        toggleBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          dropdown.classList.toggle("hidden");
        });

        dropdown.querySelectorAll("button").forEach((btn) => {
          btn.addEventListener("click", () => {
            updateFilter(key, btn.dataset.value);
            window.location.reload();
          });
        });

        container.appendChild(pill);
      }
    });

    // close dropdowns when clicking outside
    document.addEventListener("click", () => {
      document
        .querySelectorAll(".filter-dropdown")
        .forEach((el) => el.classList.add("hidden"));
    });

    // const filtersCurrent = getActiveFilters();

    // const hasActiveSecondaryFilters = Object.entries(FILTER_CONFIG).some(
    //   ([key, config]) =>
    //     config.type === "secondary" &&
    //     filtersCurrent[key] !== config.defaultValue,
    // );

    // if (hasActiveSecondaryFilters) {
    //   secondaryFilters.classList.remove("secondary-filters--collapsed");
    //   toggle.setAttribute("aria-expanded", "true");
    // }
  }

  // Clear button
  const clearBtn = buttonsContainer.querySelector("#clear-filters");
  if (clearBtn) {
    clearBtn.addEventListener("click", (e) => {
      e.preventDefault();
      clearFilters();
      window.location.href = "/services";
    });
  }

  const filters = getActiveFilters();

  if (clearBtn && filters.useCases.length === 0) {
    clearBtn.classList.add("active");
  }

  renderFilterPills();
});

const referralSelect = document.getElementById("referral-filter");

if (referralSelect) {
  const filters = getActiveFilters();
  referralSelect.value = filters.professionalReferral || "exclude";

  referralSelect.addEventListener("change", () => {
    updateFilter("professionalReferral", referralSelect.value);
    window.location.reload();
  });
}

// function moveActiveFilterNextToAll(container) {
//   const allBtn = container.querySelector("#clear-filters");
//   const activeBtn = container.querySelector(".filter-btn.active");

//   if (!allBtn || !activeBtn) return;

//   // Insert active filter immediately after "All"
//   if (allBtn.nextSibling !== activeBtn) {
//     container.insertBefore(activeBtn, allBtn.nextSibling);
//   }
// }

// document.addEventListener("DOMContentLoaded", () => {
//   const panel = document.getElementById("filter-panel");
//   const toggle = panel?.querySelector(".filter-toggle");

//   if (!panel || !toggle) return;

//   toggle.addEventListener("click", () => {
//     const isCollapsed = panel.classList.toggle("collapsed");
//     toggle.setAttribute("aria-expanded", String(!isCollapsed));
//   });
// });

// function updateFilterToggleLabel() {
//   const filters = getActiveFilters();
//   const count = filters.useCases.length;

//   toggle.textContent = count ? `Filters (${count})` : "Filters";
// }

/* auto-open if filters are active */
// const filters = getActiveFilters();
// if (filters.useCases.length > 0) {
//   panel.classList.remove("collapsed");
//   toggle.setAttribute("aria-expanded", "true");
// }

// toggle.addEventListener("click", () => {
//   const isCollapsed = panel.classList.toggle("collapsed");
//   toggle.setAttribute("aria-expanded", String(!isCollapsed));

//   localStorage.setItem("filtersOpen", String(!isCollapsed));
// });

// const isOpen = localStorage.getItem("filtersOpen") === "true";
// if (isOpen) {
//   panel.classList.remove("collapsed");
//   toggle.setAttribute("aria-expanded", "true");
// }
