import { setOnlineStatus } from "./openAlwaysTopOnWindow";

const ONLINE_STATUS_KEY = "IS_ONLINE";
// Load checkbox state from localStorage
export const isOnlineCheckbox = document.querySelector<HTMLInputElement>('#is-online-checkbox')!;
isOnlineCheckbox.checked = localStorage.getItem(ONLINE_STATUS_KEY) === "true";

// Save checkbox state to localStorage when changed
isOnlineCheckbox.addEventListener('change', () => {
    localStorage.setItem(ONLINE_STATUS_KEY, isOnlineCheckbox.checked.toString());
    setOnlineStatus(isOnlineCheckbox.checked ? '✅' : '❌');
});

