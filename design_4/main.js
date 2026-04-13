(function () {
  const SELECTORS = {
    nav: ".nav",
    navToggle: ".nav-toggle",
    galleryTrack: "[data-gallery-track]",
    sections: "section[id]",
    year: "#year",
  };

  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  function setupNavigation() {
    const toggle = qs(SELECTORS.navToggle);
    const nav = qs(SELECTORS.nav);

    if (!toggle || !nav) return;

    const closeNav = () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    qsa("a", nav).forEach((link) => {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });
  }

  function setupGallery(track) {
    let isDragging = false;
    let dragMoved = false;
    let startX = 0;
    let startScrollLeft = 0;

    track.setAttribute("aria-label", "Horizontale fotogalerij");
    track.setAttribute("tabindex", track.getAttribute("tabindex") || "0");
    track.style.cursor = "grab";
    track.style.userSelect = "none";
    track.style.scrollSnapType = "none";

    qsa("img", track).forEach((image) => {
      image.draggable = false;
    });

    const maxScrollLeft = () => Math.max(0, track.scrollWidth - track.clientWidth);
    const canScroll = () => maxScrollLeft() > 1;
    const atStart = () => track.scrollLeft <= 1;
    const atEnd = () => track.scrollLeft >= maxScrollLeft() - 1;

    const gapSize = () => {
      const style = window.getComputedStyle(track);
      return parseFloat(style.columnGap || style.gap || "0") || 0;
    };

    const itemStep = () => {
      const item = qs(".gallery__item", track);
      if (!item) return Math.max(220, track.clientWidth * 0.75);
      return item.getBoundingClientRect().width + gapSize();
    };

    const normalizeWheel = (event) => {
      const dominantDelta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;

      if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return dominantDelta * 42;
      if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return dominantDelta * track.clientWidth;
      return dominantDelta;
    };

    const scrollByAmount = (amount, behavior = "auto") => {
      if (!amount || !canScroll()) return;
      track.scrollBy({ left: amount, behavior });
    };

    track.addEventListener(
      "wheel",
      (event) => {
        if (!canScroll()) return;

        const amount = normalizeWheel(event);
        if (!amount) return;

        const scrollingRight = amount > 0;
        if ((scrollingRight && atEnd()) || (!scrollingRight && atStart())) return;

        event.preventDefault();
        scrollByAmount(amount);
      },
      { passive: false }
    );

    track.addEventListener("keydown", (event) => {
      if (!canScroll()) return;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollByAmount(itemStep(), "smooth");
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollByAmount(-itemStep(), "smooth");
      }

      if (event.key === "Home") {
        event.preventDefault();
        track.scrollTo({ left: 0, behavior: "smooth" });
      }

      if (event.key === "End") {
        event.preventDefault();
        track.scrollTo({ left: maxScrollLeft(), behavior: "smooth" });
      }
    });

    track.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || event.pointerType === "touch" || !canScroll()) return;

      isDragging = true;
      dragMoved = false;
      startX = event.clientX;
      startScrollLeft = track.scrollLeft;
      track.style.cursor = "grabbing";
      track.setPointerCapture(event.pointerId);
    });

    track.addEventListener("pointermove", (event) => {
      if (!isDragging) return;

      const deltaX = event.clientX - startX;
      if (Math.abs(deltaX) > 3) dragMoved = true;

      track.scrollLeft = startScrollLeft - deltaX;
      event.preventDefault();
    });

    const stopDragging = (event) => {
      if (!isDragging) return;

      isDragging = false;
      track.style.cursor = "grab";

      if (track.hasPointerCapture(event.pointerId)) {
        track.releasePointerCapture(event.pointerId);
      }
    };

    track.addEventListener("pointerup", stopDragging);
    track.addEventListener("pointercancel", stopDragging);
    track.addEventListener(
      "click",
      (event) => {
        if (!dragMoved) return;
        event.preventDefault();
        event.stopPropagation();
        dragMoved = false;
      },
      true
    );
  }

  function setupScrollMargins() {
    const header = qs(".header");
    const sections = qsa(SELECTORS.sections);

    const update = () => {
      const offset = (header?.offsetHeight || 72) + 10;
      sections.forEach((section) => {
        section.style.scrollMarginTop = `${offset}px`;
      });
    };

    update();
    window.addEventListener("resize", update);
  }

  function setupFooterYear() {
    const year = qs(SELECTORS.year);
    if (year) year.textContent = String(new Date().getFullYear());
  }

  setupNavigation();
  qsa(SELECTORS.galleryTrack).forEach(setupGallery);
  setupScrollMargins();
  setupFooterYear();
})();
