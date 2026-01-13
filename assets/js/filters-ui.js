document.addEventListener("DOMContentLoaded", () => {
  const panel = document.getElementById("filter-panel");
  if (!panel) return;

  const buttonsContainer = panel.querySelector(".filter-buttons");
  if (!buttonsContainer) return;

  // Clear any existing buttons
  //   buttonsContainer.innerHTML = "";
  buttonsContainer
    .querySelectorAll(".filter-btn")
    .forEach((btn) => btn.remove());

  Object.entries(useCasesDict).forEach(([key, label]) => {
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.dataset.usecase = key;
    btn.textContent = label;

    // check if already active
    const filters = getActiveFilters();
    if (filters.useCases.includes(key)) btn.classList.add("active");

    btn.addEventListener("click", () => {
      // 🔑 single-select behaviour
      setActiveFilters({
        useCases: [key],
      });

      // go straight to services page
      window.location.href = "/services.html";
    });

    buttonsContainer.appendChild(btn);
  });

  //   moveActiveFilterNextToAll(buttonsContainer);

  // Clear button
  const clearBtn = buttonsContainer.querySelector("#clear-filters");
  if (clearBtn) {
    clearBtn.addEventListener("click", (e) => {
      e.preventDefault(); // safety

      setActiveFilters({ useCases: [] });
      window.location.href = "/services.html";
    });
  }

  const filters = getActiveFilters();

  if (clearBtn && filters.useCases.length === 0) {
    clearBtn.classList.add("active");
  }
});

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
