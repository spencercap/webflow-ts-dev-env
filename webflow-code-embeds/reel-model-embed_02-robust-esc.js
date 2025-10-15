// === Elements & Vimeo player ===
const dialogElem = document.getElementById("dialogReel");
const showBtn = document.querySelector(".cta-reel-trigger");
const vIframe = document.getElementById("vimeoIframeReel");
const vimeoPlayer = new Vimeo.Player(vIframe);

// Make dialog focusable so it can receive keyboard events
if (!dialogElem.hasAttribute('tabindex')) {
  dialogElem.setAttribute('tabindex', '-1');
}

// Optional: ensure iframe is focusable by mouse but not by keyboard tab (avoid accidental tab stops)
// vIframe.setAttribute('tabindex', '-1'); // uncomment if you want iframe skipped by tabbing

// Ensure video starts paused
vimeoPlayer.pause();


// === Helper: close modal and pause video ===
function closeModal() {
  // Pause video first so audio doesn't continue
  vimeoPlayer.pause();

  // Close the <dialog>
  if (dialogElem.open) {
    dialogElem.close();
  }
}


// === Background (overlay) click handling ===
// If user clicks outside the dialog content area, close the dialog
dialogElem.addEventListener('click', (event) => {
  const rect = dialogElem.getBoundingClientRect();
  const isInDialog =
    rect.top <= event.clientY &&
    event.clientY <= rect.top + rect.height &&
    rect.left <= event.clientX &&
    event.clientX <= rect.left + rect.width;

  if (!isInDialog) {
    closeModal();
  }
});


// === Open modal / play video ===
showBtn.addEventListener("click", () => {
  dialogElem.showModal();

  // Move keyboard focus into the dialog so it receives key events (important when iframe exists)
  // Putting focus on the dialog itself is simplest; you may instead focus a close button for better UX.
  dialogElem.focus();

  // Play and set volume
  vimeoPlayer.play();
  vimeoPlayer.setVolume(1);
});


// === Close button (recommended) ===
// If you have an explicit close button inside the dialog, wire it up.
// If your HTML already contains a .dialog-close button, this will attach behaviour.
const existingCloseBtn = dialogElem.querySelector('.dialog-close');
if (existingCloseBtn) {
  existingCloseBtn.addEventListener('click', closeModal);
}


// === Keyboard handling: Escape key ===
// Primary listener on the dialog element (works if dialog has focus)
dialogElem.addEventListener('keydown', (event) => {
  const key = event.key || event.keyIdentifier || event.code;
  if (key === 'Escape' || key === 'Esc') {
    event.preventDefault();
    closeModal();
  }
});

// Fallback: document-level listener (capture phase) — may not fire if iframe has focus,
// but helpful in many cases. Keep it lightweight.
document.addEventListener('keydown', (event) => {
  if ((event.key === 'Escape' || event.key === 'Esc') && dialogElem.open) {
    event.preventDefault();
    closeModal();
  }
}, true); // use capture to try to catch early
