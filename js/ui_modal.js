// File: js/ui_modal.js
(function () {
  const { $ } = window.UIH;

  function ensure() {
    if (document.getElementById("modalOverlay")) return;
    const ov = document.createElement("div");
    ov.id="modalOverlay"; ov.className="modalOverlay hidden";
    ov.innerHTML = `
      <div class="modalCard" role="dialog" aria-modal="true">
        <div class="modalHeader">
          <div class="modalTitle" id="modalTitle">Edit</div>
          <button type="button" class="modalCloseBtn" id="modalCloseBtn">✕</button>
        </div>
        <div class="modalBody" id="modalBody"></div>
        <div class="modalFooter">
          <button type="button" class="secondary" id="modalCancelBtn">Close</button>
        </div>
      </div>`;
    document.body.appendChild(ov);
    const close = () => hide();
    $("modalCloseBtn").addEventListener("click", close);
    $("modalCancelBtn").addEventListener("click", close);
    ov.addEventListener("click",(e)=>{ if(e.target===ov) close(); });
    document.addEventListener("keydown",(e)=>{ if(e.key==="Escape" && !ov.classList.contains("hidden")) close(); });
  }

  function show(title, html) {
    ensure();
    $("modalTitle").textContent = title;
    $("modalBody").innerHTML = html;
    document.getElementById("modalOverlay").classList.remove("hidden");
  }

  function hide() {
    const ov = document.getElementById("modalOverlay");
    if (ov) ov.classList.add("hidden");
  }

  window.UIModal = { show, hide };
})();
