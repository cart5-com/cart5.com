import { currentPrintTasks } from "./listenTasks";
import { getMainWindow } from "./mainWindow";

export const restartApp = async () => {
    var isAbleToRestartNow = true;
    if (currentPrintTasks.length > 0) {
        isAbleToRestartNow = false;
    }
    if (isAbleToRestartNow) {
        if (typeof global !== "undefined") {
            window.location.reload();
        } else if (process.platform === "win32") {
            const path = require('path');
            var child = require("child_process").spawn(
                process.execPath,
                require('nw.gui').App.argv, {
                cwd: path.dirname(process.cwd()),
                detached: true,
                // stdio: "inherit"
            });
            //Don't wait for it
            child.unref();
            require('nw.gui').App.quit();
        } else {
            getMainWindow().reload();
        }
    } else {
        console.log('there are waiting task, wait 5 secs then try again');
        await new Promise(resolve => setTimeout(resolve, 5000));
        restartApp();
    }
}
