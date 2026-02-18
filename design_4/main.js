(function () {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");

  function closeNav() {
    if (!nav) return;
    nav.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
  }

  toggle?.addEventListener("click", () => {
    if (!nav) return;
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.querySelectorAll(".nav a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNav();
  });

  document.querySelectorAll("[data-gallery-track]").forEach((track) => {
    track.setAttribute("aria-label", "Horizontale fotogalerij");
  });

  const header = document.querySelector(".header");
  const sectionNodes = document.querySelectorAll("section[id]");

  const setScrollMargins = () => {
    const offset = (header?.offsetHeight || 72) + 10;
    sectionNodes.forEach((section) => {
      section.style.scrollMarginTop = `${offset}px`;
    });
  };

  setScrollMargins();
  window.addEventListener("resize", setScrollMargins);

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
