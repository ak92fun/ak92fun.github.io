// copy-rows.js
(() => {
  "use strict";

  function rowToTSV(tr) {
    const cells = Array.from(tr.querySelectorAll("td, th"))
      .filter((cell) => !cell.classList.contains("copy-col"));
  
    return cells
      .map((c) => (c.innerText || "").replace(/\s+/g, " ").trim())
      .join("\t");
  }

  async function copyText(text) {
    // Preferred modern API (works on HTTPS + most modern browsers)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    // Fallback for older browsers / non-secure contexts
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }

  function addCopyButtonsToTable(table) {
    const tbodyRows = table.querySelectorAll("tbody tr");
    if (!tbodyRows.length) return;

    // Add an extra header cell so the column count stays consistent
    const headerRow = table.querySelector("thead tr");
    if (headerRow && !headerRow.querySelector(".copy-col")) {
      const th = document.createElement("th");
      th.className = "copy-col";
      th.style.textAlign = "center";
      th.textContent = "Copy";
      headerRow.appendChild(th);
    }

    tbodyRows.forEach((tr) => {
      // Avoid double-inserting if script runs twice
      if (tr.querySelector(".copy-row-btn")) return;

      const td = document.createElement("td");
      td.className = "copy-col";
      td.style.textAlign = "center";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy-row-btn";
      btn.textContent = "Copy";

      btn.addEventListener("click", async () => {
        const tsv = rowToTSV(tr);

        try {
          await copyText(tsv);
          const old = btn.textContent;
          btn.textContent = "Copied!";
          btn.disabled = true;

          setTimeout(() => {
            btn.textContent = old;
            btn.disabled = false;
          }, 900);
        } catch (err) {
          console.error(err);
          btn.textContent = "Failed";
          setTimeout(() => (btn.textContent = "Copy"), 1200);
        }
      });

      td.appendChild(btn);
      tr.appendChild(td);
    });
  }

  function initCopyButtons() {
    document.querySelectorAll("table").forEach(addCopyButtonsToTable);
  }

  // Run after DOM is ready (defer already helps, this is extra-safe)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCopyButtons);
  } else {
    initCopyButtons();
  }
})();
