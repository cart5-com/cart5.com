import { clearWhoamiCache, initializeUserStore } from "../stores/User.store";

document.addEventListener("DOMContentLoaded", () => {
    if (window.location.hash === '#after-login') {
        clearWhoamiCache();
        initializeUserStore();
        history.replaceState(null, '', ' ');
    }
});