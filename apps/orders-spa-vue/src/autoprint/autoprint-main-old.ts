// import { focusGlobalWindow } from "./focusGlobalWindow";
import { killApp } from "./killApp";
// import { getMainWindow } from "./mainWindow";
// import { openAlwaysTopOnWindow } from "./openAlwaysTopOnWindow";
import { onClickPairDevice, stopPairing } from "./pairing";
import { initTaskListener } from "./listenTasks";
import { restartApp } from "./restartApp";

// // document.querySelector<HTMLDivElement>('#app')!.innerHTML = `autoprint`
// if (typeof global !== "undefined") {
//     global.mainWindow = getMainWindow();
//     global.mainWindow.on('closed', function () {
//         global.mainWindow?.hide();
//     });
//     global.mainWindow.on('close', function () {
//         global.mainWindow?.hide();
//     });
//     // document.querySelector<HTMLDivElement>('#app')!.innerHTML += `I have global with nw.js`
//     if (import.meta.env.DEV) {
//         global.mainWindow.showDevTools();
//     }
//     focusGlobalWindow();
//     (global as any).focusGlobalWindow = focusGlobalWindow;
// }
// openAlwaysTopOnWindow();

// Initialize task listener
initTaskListener();

document.querySelector<HTMLButtonElement>('#pair-device')!.addEventListener('click', onClickPairDevice);
document.querySelector<HTMLButtonElement>('#stop-pairing')!.addEventListener('click', stopPairing);
document.querySelector<HTMLButtonElement>('#kill-app')!.addEventListener('click', killApp);
document.querySelector<HTMLButtonElement>('#restart-app')!.addEventListener('click', restartApp);
// restart app after 6 hours
setTimeout(() => {
    restartApp();
}, 6 * 60 * 60 * 1000);
