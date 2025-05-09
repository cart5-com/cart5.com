import { focusGlobalWindow } from "./focusGlobalWindow";
import { killApp } from "./killApp";
import { getMainWindow } from "./mainWindow";
import { openAlwaysTopOnWindow } from "./openAlwaysTopOnWindow";
import { onClickPairDevice, stopPairing } from "./pairing";
import { testPrint } from "./printHTML";
import { initTaskListener } from "./listenTasks";

// document.querySelector<HTMLDivElement>('#app')!.innerHTML = `autoprint`
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
}
openAlwaysTopOnWindow();

// Initialize task listener
initTaskListener();

document.querySelector<HTMLButtonElement>('#pair-device')!.addEventListener('click', onClickPairDevice);
document.querySelector<HTMLButtonElement>('#stop-pairing')!.addEventListener('click', stopPairing);
document.querySelector<HTMLButtonElement>('#kill-app')!.addEventListener('click', killApp);
document.querySelector<HTMLButtonElement>('#test-print')!.addEventListener('click', testPrint);