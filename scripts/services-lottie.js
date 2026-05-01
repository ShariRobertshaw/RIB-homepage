/**
 * Spin each card shape once via Lottie (no loop) when Services enters the viewport.
 * Loads JSON locally with fetch + animationData (works reliably vs path alone).
 */
(function () {
  function getLottie() {
    return window.lottie || window.bodymovin;
  }

  function init() {
    var section = document.querySelector(".services");
    var Lottie = getLottie();
    if (!section || !Lottie) return;

    var reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var nodes = Array.prototype.slice.call(
      section.querySelectorAll(".services__lottie[data-lottie-src]")
    );

    function mount(el, staggerMs, data) {
      setTimeout(function () {
        try {
          var anim = Lottie.loadAnimation({
            container: el,
            renderer: "svg",
            loop: false,
            autoplay: !reduceMotion,
            animationData: data,
            rendererSettings: {
              preserveAspectRatio: "xMidYMid meet",
              progressiveLoad: false
            }
          });

          anim.addEventListener("data_failed", function () {
            el.setAttribute("data-lottie-error", "");
          });

          function showFinalFrame() {
            var last =
              typeof anim.totalFrames === "number"
                ? Math.max(0, Math.floor(anim.totalFrames - 1))
                : null;
            if (last !== null) {
              anim.goToAndStop(last, true);
            }
          }

          if (reduceMotion) {
            if (anim.addEventListener) {
              anim.addEventListener("DOMLoaded", function onDom() {
                anim.removeEventListener("DOMLoaded", onDom);
                showFinalFrame();
              });
              anim.addEventListener("error", showFinalFrame);
            }
          }
        } catch (err) {
          el.setAttribute("data-lottie-error", "");
        }
      }, staggerMs);
    }

    var started = false;
    var fallbackTimer = null;
    function fire() {
      if (started) return;
      started = true;
      if (fallbackTimer !== null) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }

      var loaders = nodes.map(function (el, idx) {
        var rel = el.getAttribute("data-lottie-src");
        if (!rel) return Promise.resolve(null);
        var url = new URL(rel, window.location.href).href;
        return fetch(url, { credentials: "same-origin" }).then(function (res) {
          if (!res.ok) throw new Error("lottie-json");
          return res.json();
        });
      });

      Promise.all(loaders)
        .then(function (payloads) {
          payloads.forEach(function (data, idx) {
            if (data && nodes[idx]) {
              mount(nodes[idx], idx * 110, data);
            }
          });
        })
        .catch(function () {
          nodes.forEach(function (el) {
            el.setAttribute("data-lottie-error", "");
          });
        });
    }

    if (typeof IntersectionObserver === "undefined") {
      fire();
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            io.disconnect();
            fire();
            return;
          }
        }
      },
      { threshold: 0, rootMargin: "80px 0px 80px 0px" }
    );
    io.observe(section);

    fallbackTimer = setTimeout(function () {
      if (!started) {
        io.disconnect();
        fire();
      }
    }, 2500);
  }

  function bootstrap() {
    if (!getLottie()) {
      window.addEventListener(
        "load",
        function onLoad() {
          window.removeEventListener("load", onLoad);
          init();
        },
        { passive: true }
      );
      return;
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init, { passive: true });
    } else {
      init();
    }
  }

  bootstrap();
})();
