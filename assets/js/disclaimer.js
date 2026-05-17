function renderDisclaimer() {
  return `
  <p class="disclaimer-text">
  <b>Please note:</b> Collection of data is manual, and though every
          effort is made to keep information up-to-date, please confirm with organisers before making plans.
  </p>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const disclaimerContainer = document.getElementById("disclaimer");
  if (!disclaimerContainer) return;

  disclaimerContainer.innerHTML = renderDisclaimer();
});
