
(function () {
  function measureMusicMaxWidth() {
    const musicBlock = document.querySelector(".page-music .music-block");
    if (!musicBlock) return;

    const tables = musicBlock.querySelectorAll(".music-section table");
    if (!tables.length) return;

    // Create (or reuse) an offscreen measurement container
    let measurer = document.getElementById("music-measurer");
    if (!measurer) {
      measurer = document.createElement("div");
      measurer.id = "music-measurer";
      measurer.setAttribute("aria-hidden", "true");
      measurer.style.position = "absolute";
      measurer.style.left = "-99999px";
      measurer.style.top = "0";
      measurer.style.visibility = "hidden";
      measurer.style.pointerEvents = "none";
      measurer.style.height = "0";
      measurer.style.overflow = "hidden";
      document.body.appendChild(measurer);
    }

    let max = 0;

    tables.forEach((table) => {
      // If the table is already rendered (open section), measure directly
      const rect = table.getBoundingClientRect();
      const isRendered = rect.width > 0;

      if (isRendered) {
        max = Math.max(max, rect.width);
        return;
      }

      // Otherwise, the section is collapsed: clone and measure offscreen
      const clone = table.cloneNode(true);

      // Ensure it measures at "natural" width like your CSS tables
      clone.style.width = "max-content";
      clone.style.maxWidth = "none";

      measurer.appendChild(clone);

      const w = clone.getBoundingClientRect().width;
      max = Math.max(max, w);

      measurer.removeChild(clone);
    });

    // If you want to include the left/right padding used by .music-block (16px),
    // you can optionally add it here. Usually not necessary since header/hr are inside.
    musicBlock.style.setProperty("--music-max-width", `${Math.ceil(max)}px`);
  }

  // Run after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", measureMusicMaxWidth);
  } else {
    measureMusicMaxWidth();
  }

  // Re-run when details are toggled (tables may render directly)
  document.addEventListener("toggle", (e) => {
    if (e.target && e.target.matches(".page-music details")) {
      measureMusicMaxWidth();
    }
  }, true);

  // Re-run on resize (responsive fonts / viewport changes)
  window.addEventListener("resize", () => {
    // small debounce
    clearTimeout(window.__musicWidthTimer);
    window.__musicWidthTimer = setTimeout(measureMusicMaxWidth, 100);
  });

  // Re-run after fonts load (can affect table width)
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(measureMusicMaxWidth).catch(() => {});
  }
})();

