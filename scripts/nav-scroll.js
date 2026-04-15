/**
 * Primary nav: in document flow (scrolls away).
 * Fixed pill: slides in after primary clears the viewport; slides up when scrollY < hideY (scroll up), before primary returns.
 */
(function () {
  var primary = document.getElementById("site-nav-primary");
  var fixed = document.getElementById("site-nav-fixed");
  if (!primary || !fixed) return;

  var hideY = 0;
  var lastY = window.scrollY || 0;
  var fixedVisible = false;

  function measure() {
    var h = primary.offsetHeight;
    hideY = Math.max(28, Math.min(56, h - 32));
  }

  function setAria(primaryHidden) {
    primary.setAttribute("aria-hidden", primaryHidden ? "true" : "false");
    fixed.setAttribute("aria-hidden", primaryHidden ? "false" : "true");
  }

  function primaryPastViewport() {
    return primary.getBoundingClientRect().bottom <= 0;
  }

  /** Init / resize: derive visibility from geometry (handles mid-page load). */
  function syncPosition() {
    var y = window.scrollY || 0;

    if (y < 1) {
      if (fixedVisible) {
        fixedVisible = false;
        fixed.classList.remove("is-visible");
        setAria(false);
      }
      lastY = y;
      return;
    }

    if (primaryPastViewport()) {
      if (!fixedVisible) {
        fixedVisible = true;
        fixed.classList.add("is-visible");
        setAria(true);
      }
    } else if (y < hideY) {
      if (fixedVisible) {
        fixedVisible = false;
        fixed.classList.remove("is-visible");
        setAria(false);
      }
    }

    lastY = y;
  }

  function updateFromScroll() {
    var y = window.scrollY || 0;
    var scrollingDown = y > lastY;

    if (y < 1 && fixedVisible) {
      fixedVisible = false;
      fixed.classList.remove("is-visible");
      setAria(false);
      lastY = y;
      return;
    }

    if (scrollingDown) {
      if (primaryPastViewport() && !fixedVisible) {
        fixedVisible = true;
        fixed.classList.add("is-visible");
        setAria(true);
      }
    } else {
      if (y < hideY && fixedVisible) {
        fixedVisible = false;
        fixed.classList.remove("is-visible");
        setAria(false);
      }
    }

    lastY = y;
  }

  var ticking = false;
  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        updateFromScroll();
      });
    }
  }

  function init() {
    measure();
    setAria(false);
    lastY = window.scrollY || 0;
    syncPosition();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener(
      "resize",
      function () {
        measure();
        syncPosition();
      },
      { passive: true }
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
