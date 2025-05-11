import "@/index.css";
import * as Sentry from "@sentry/vue";
import { createApp } from 'vue'
import AutoprintView from './AutoprintView.vue'
import { getMainWindow } from './utils/mainWindow';
import { focusGlobalWindow } from './utils/focusGlobalWindow';
import { restartApp } from "./utils/restartApp";
import { openAlwaysTopOnWindow } from './openAlwaysTopOnWindow';

if (typeof global !== "undefined") {
    global.mainWindow = getMainWindow();
    setTimeout(() => {
        global.mainWindow?.hide();
    });
    global.mainWindow.on('closed', function () {
        global.mainWindow?.hide();
    });
    global.mainWindow.on('close', function () {
        global.mainWindow?.hide();
    });
    if (import.meta.env.DEV) {
        global.mainWindow.showDevTools();
    }
    focusGlobalWindow();
    (global as any).focusGlobalWindow = focusGlobalWindow;
}
openAlwaysTopOnWindow();

const app = createApp(AutoprintView);
if (import.meta.env.PROD) {
    Sentry.init({
        app,
        dsn: "https://777dc381fa51711fceabc8ad5ff3ab18@o4509024863518720.ingest.us.sentry.io/4509266332876800",
        sendDefaultPii: true
    });
}
app.mount('#app');


// restart app after 6 hours
setTimeout(() => {
    restartApp();
}, 6 * 60 * 60 * 1000);
