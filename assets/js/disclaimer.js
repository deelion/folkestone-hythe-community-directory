function renderDisclaimer() {
  return `
  <p class="disclaimer-text">
  <b>Please note:</b> Collection of data is manual, and while every
          effort is made to keep things updated, some information may be out of
          date - please confirm with organisers before making plans.
  </p>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const disclaimerContainer = document.getElementById("disclaimer");
  if (!disclaimerContainer) return;

  disclaimerContainer.innerHTML = renderDisclaimer();
});
