import { getMainWindow } from "./mainWindow";
import { onClickPairDevice } from "./pairing";
// document.querySelector<HTMLDivElement>('#app')!.innerHTML = `autoprint`

if (typeof global !== "undefined") {
    // document.querySelector<HTMLDivElement>('#app')!.innerHTML += `I have global with nw.js`
    if (import.meta.env.DEV) {
        console.log('dev mode');
        getMainWindow().showDevTools();
    }
}


document.querySelector<HTMLButtonElement>('#pair-device')!.addEventListener('click', onClickPairDevice);