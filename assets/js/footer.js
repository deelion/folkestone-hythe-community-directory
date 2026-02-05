document.addEventListener("DOMContentLoaded", () => {
  const footer = document.createElement("footer");
  footer.innerHTML = `
    <p>
        <b>
            <a
              href="https://github.com/deelion/folkestone-hythe-community-directory"
              >Made with goodneighbours</a></b>, an open source community directory framework.
    </p>
  `;
  footer.className = "site-footer";

  document.body.appendChild(footer);
});
