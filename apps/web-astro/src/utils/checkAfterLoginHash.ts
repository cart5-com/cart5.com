import { initializeUserStore } from "../stores/User.store";

document.addEventListener("DOMContentLoaded", () => {
    if (window.location.hash === '#after-login') {
        initializeUserStore();
        history.replaceState(null, '', ' ');
    }
});