/**
 * Splits the hero headline into measured visual lines (word boundaries only),
 * then sets --hero-line-count for CSS animation delays (timing in main.css :root).
 * Re-runs on resize (debounced).
 */
(function () {
  var h1 = document.getElementById("hero-title");
  var hero = document.querySelector(".hero");
  if (!h1 || !hero) return;

  var resizeTimer;

  function wrapHeadlineLines() {
    var raw = h1.dataset.originalHeadline || h1.textContent.trim();
    if (!h1.dataset.originalHeadline) {
      h1.dataset.originalHeadline = raw;
    }
    var words = raw.split(/\s+/).filter(Boolean);
    if (words.length === 0) return;

    h1.textContent = "";
    var wordSpans = words.map(function (w, i) {
      var span = document.createElement("span");
      span.className = "hero__title-word";
      span.textContent = w;
      h1.appendChild(span);
      if (i < words.length - 1) {
        h1.appendChild(document.createTextNode(" "));
      }
      return span;
    });

    void h1.offsetHeight;

    var lines = [];
    var batch = [];
    var batchTop = null;
    wordSpans.forEach(function (span) {
      var t = span.offsetTop;
      if (batchTop === null) {
        batchTop = t;
        batch = [span];
      } else if (Math.abs(t - batchTop) < 3) {
        batch.push(span);
      } else {
        lines.push(batch);
        batch = [span];
        batchTop = t;
      }
    });
    if (batch.length) {
      lines.push(batch);
    }

    h1.textContent = "";
    lines.forEach(function (lineWords, idx) {
      var line = document.createElement("span");
      line.className = "hero__title-line";
      line.style.setProperty("--line-index", String(idx));
      lineWords.forEach(function (node, wi) {
        line.appendChild(node);
        if (wi < lineWords.length - 1) {
          line.appendChild(document.createTextNode(" "));
        }
      });
      h1.appendChild(line);
    });

    h1.classList.add("hero__title--split");
    document.documentElement.style.setProperty("--hero-line-count", String(lines.length));
    hero.classList.add("hero--intro-ready");
  }

  function run() {
    requestAnimationFrame(function () {
      requestAnimationFrame(wrapHeadlineLines);
    });
  }

  function init() {
    run();
    window.addEventListener(
      "resize",
      function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          wrapHeadlineLines();
        }, 150);
      },
      { passive: true }
    );
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(init);
  } else {
    init();
  }
})();
