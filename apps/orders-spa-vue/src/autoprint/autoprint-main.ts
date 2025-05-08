import { focusGlobalWindow } from "./focusGlobalWindow";
import { killApp } from "./killApp";
import { getMainWindow } from "./mainWindow";
import { openAlwaysTopOnWindow } from "./openAlwaysTopOnWindow";
import { onClickPairDevice, stopPairing } from "./pairing";
// document.querySelector<HTMLDivElement>('#app')!.innerHTML = `autoprint`

const ACTIVE_STATUS_KEY = "IS_AUTOPRINT_ACTIVE";

// Load checkbox state from localStorage
const isActiveCheckbox = document.querySelector<HTMLInputElement>('#is-active-checkbox')!;
isActiveCheckbox.checked = localStorage.getItem(ACTIVE_STATUS_KEY) === "true";

// Save checkbox state to localStorage when changed
isActiveCheckbox.addEventListener('change', () => {
    localStorage.setItem(ACTIVE_STATUS_KEY, isActiveCheckbox.checked.toString());
});

if (typeof global !== "undefined") {
    global.mainWindow = getMainWindow();
    global.mainWindow.on('closed', function () {
        global.mainWindow?.hide();
    });
    global.mainWindow.on('close', function () {
        global.mainWindow?.hide();
    });
    // document.querySelector<HTMLDivElement>('#app')!.innerHTML += `I have global with nw.js`
    if (import.meta.env.DEV) {
        global.mainWindow.showDevTools();
    }
    focusGlobalWindow();
    openAlwaysTopOnWindow();
}
document.querySelector<HTMLButtonElement>('#pair-device')!.addEventListener('click', onClickPairDevice);
document.querySelector<HTMLButtonElement>('#stop-pairing')!.addEventListener('click', stopPairing);
document.querySelector<HTMLButtonElement>('#kill-app')!.addEventListener('click', killApp);