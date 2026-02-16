
(() => {
  function getAllPickableRows() {
    const rows = Array.from(document.querySelectorAll("table tbody tr"));
    return rows.filter((tr) => tr.querySelectorAll("td").length > 0);
  }

  function pickRandomRow() {
    const rows = getAllPickableRows();
    if (!rows.length) return null;
    return rows[Math.floor(Math.random() * rows.length)];
  }

  function getColumnWidthsPx(table, cellCount) {
    // Prefer header cells for measuring widths; fallback to first body row
    const headerCells = Array.from(table.querySelectorAll("thead th"));
    if (headerCells.length >= cellCount) {
      return headerCells.slice(0, cellCount).map((c) => Math.round(c.getBoundingClientRect().width));
    }

    const firstBodyRow = table.querySelector("tbody tr");
    if (firstBodyRow) {
      const tds = Array.from(firstBodyRow.querySelectorAll("td"));
      if (tds.length >= cellCount) {
        return tds.slice(0, cellCount).map((c) => Math.round(c.getBoundingClientRect().width));
      }
    }

    // Last resort: auto widths
    return new Array(cellCount).fill(null);
  }


  function renderPickedRow(tr) {
    const host = document.getElementById("randomPickResult");
    if (!host) return;
  
    const originalTable = tr.closest("table");
    if (!originalTable) return;
  
    // Create a minimal table that looks the same but doesn't stretch
    const outTable = document.createElement("table");
    outTable.className = originalTable.className;
  
    // IMPORTANT: let it size to content only
    outTable.style.width = "auto";
    outTable.style.display = "inline-table";
  
    const tbody = document.createElement("tbody");
    tbody.appendChild(tr.cloneNode(true));
    outTable.appendChild(tbody);
  
    host.innerHTML = "";
    host.appendChild(outTable);
  
    document.dispatchEvent(new CustomEvent("rows:added", { detail: host }));
  }

  function reserveResultHeight() {
    const host = document.getElementById("randomPickResult");
    if (!host) return;
  
    const sampleRow = document.querySelector("table tbody tr");
    if (!sampleRow) return;
  
    const originalTable = sampleRow.closest("table");
    if (!originalTable) return;
  
    const probeTable = document.createElement("table");
    probeTable.className = originalTable.className;
    probeTable.style.width = "auto";
    probeTable.style.display = "inline-table";
    probeTable.style.visibility = "hidden";
    probeTable.style.position = "absolute";
    probeTable.style.left = "-9999px";
    probeTable.style.top = "0";
  
    const tbody = document.createElement("tbody");
    tbody.appendChild(sampleRow.cloneNode(true));
    probeTable.appendChild(tbody);
  
    document.body.appendChild(probeTable);
  
    // Let copy-rows attach its button (if needed), then measure
    document.dispatchEvent(new CustomEvent("rows:added", { detail: probeTable }));
  
    const h = Math.ceil(probeTable.getBoundingClientRect().height);
    document.body.removeChild(probeTable);
  
    const buffer = 2; // tiny safety margin
    host.style.setProperty("--random-pick-reserve", `${h + buffer}px`);
  }

  function initRandomPick() {
    reserveResultHeight();

    // Recalc after fonts load (prevents tiny shift)
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(reserveResultHeight);
    }

    // Recalc if layout changes (window resize)
    window.addEventListener("resize", reserveResultHeight);

    const btn = document.getElementById("randomPickBtn");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const tr = pickRandomRow();
      if (!tr) return;
      renderPickedRow(tr);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initRandomPick);
  } else {
    initRandomPick();
  }
})();

