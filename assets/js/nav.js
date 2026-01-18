function renderNav() {
  return `
    <nav class="main-nav">
      <div class="nav-inner">
        <a href="/" class="nav-logo">goodneighbours</a>
        <button class="nav-toggle" aria-label="Toggle navigation" aria-expanded="false">
          ☰
        </button>
        <div class="nav-links">
          <a href="/services.html" class="nav-link">Services</a>
          <a href="/organisations.html" class="nav-link">Organisations</a>
          <a href="/communityfeed.html" class="nav-link">Community Feed</a>
        </div>
      </div>
    </nav>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const navContainer = document.getElementById("site-nav");
  if (!navContainer) return;

  navContainer.innerHTML = renderNav();

  const toggle = navContainer.querySelector(".nav-toggle");
  const links = navContainer.querySelector(".nav-links");

  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", isOpen);
  });
});
