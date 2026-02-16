// copy-rows.js
(() => {
  "use strict";

  // Convert a table row to TSV (skip copy column)
  function rowToTSV(tr) {
    const cells = Array.from(tr.querySelectorAll("th, td")).filter(
      (cell) =>
        !cell.classList.contains("copy-col") &&
        !cell.classList.contains("nocopy")
    );
  
    return cells
      .map((cell) => (cell.innerText || "").replace(/\s+/g, " ").trim())
      .join("  ");
  }

  // Copy text with modern API + fallback
  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }

  // Inline SVG icons (stroke style, modern)
  const ICON_COPY = `
    <svg class="copy-icon" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="9" y="9" width="10" height="10" rx="2"></rect>
      <rect x="5" y="5" width="10" height="10" rx="2"></rect>
    </svg>
  `;

  const ICON_CHECK = `
    <svg class="status-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 6L9 17l-5-5"></path>
    </svg>
  `;

  const ICON_X = `
    <svg class="status-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 6L6 18"></path>
      <path d="M6 6l12 12"></path>
    </svg>
  `;

  function addCopyButtons(table) {
    const rows = table.querySelectorAll("tbody tr");
    if (!rows.length) return;

    // Add header cell once
    const headerRow = table.querySelector("thead tr");
    if (headerRow && !headerRow.querySelector(".copy-col")) {
      const th = document.createElement("th");
      th.className = "copy-col";
      th.textContent = "Copy";
      th.style.textAlign = "center";
      th.style.fontWeight = "600";
      headerRow.appendChild(th);
    }

    rows.forEach((tr) => {
      // If this row was cloned, it may already contain the button markup
      // but WITHOUT the click handler. Rebuild it to ensure it works.
      const existingCopyCell = tr.querySelector("td.copy-col");
      if (existingCopyCell) existingCopyCell.remove();
    
      const td = document.createElement("td");
      td.className = "copy-col";
      td.style.textAlign = "center";
    
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy-row-btn";
      btn.setAttribute("aria-label", "Copy row");
      btn.innerHTML = ICON_COPY;
    
      btn.addEventListener("click", async () => {
        if (btn.disabled) return;
    
        const text = rowToTSV(tr);
        btn.disabled = true;
    
        try {
          await copyText(text);
          btn.innerHTML = ICON_CHECK;
    
          setTimeout(() => {
            btn.innerHTML = ICON_COPY;
            btn.disabled = false;
          }, 900);
        } catch (err) {
          console.error(err);
          btn.innerHTML = ICON_X;
    
          setTimeout(() => {
            btn.innerHTML = ICON_COPY;
            btn.disabled = false;
          }, 1200);
        }
      });
    
      td.appendChild(btn);
      tr.appendChild(td);
    });
  }

  function init() {
    document.querySelectorAll("table").forEach(addCopyButtons);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
	
  document.addEventListener("rows:added", (e) => {
    const root = e.detail || document;
    root.querySelectorAll("table").forEach(addCopyButtons);
  });
	
})();

