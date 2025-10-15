// === Modal and Vimeo Player Setup ===

// Get modal and trigger elements
const dialogElem = document.getElementById("dialogReel");
const showBtn = document.querySelector(".cta-reel-trigger");

// Initialize Vimeo player
const vIframe = document.getElementById("vimeoIframeReel");
const vimeoPlayer = new Vimeo.Player(vIframe);

// Ensure the video starts paused
vimeoPlayer.pause();


// === Functions ===

/**
 * Closes the modal and pauses the video.
 */
function closeModal() {
	vimeoPlayer.pause();
	dialogElem.close();
}


// === Event Listeners ===

// Show modal and play video on trigger click
showBtn.addEventListener("click", () => {
	console.debug('play clicked');
	dialogElem.showModal();
	vimeoPlayer.play();
	vimeoPlayer.setVolume(1);
});

// Close modal when clicking outside of the dialog content
dialogElem.addEventListener("click", (event) => {
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

// Close modal when pressing the Escape key
document.addEventListener("keydown", (event) => {
	if (event.key === "Escape" && dialogElem.open) {
		closeModal();
	}
});
