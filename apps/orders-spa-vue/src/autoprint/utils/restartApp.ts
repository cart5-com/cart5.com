import { toast } from "@/ui-plus/sonner";
import { currentPrintTasks } from "../listenTasks";

export const restartApp = async () => {
    if (currentPrintTasks.value.length === 0) {
        if (typeof global === "undefined") {
            window.location.reload();
            // } else if (process.platform === "win32") {
            // it seems unnecessary, nw.Window.get().reload(); can handle this
            //     var child = require("child_process").spawn(
            //         process.execPath,
            //         require('nw.gui').App.argv, {
            //         cwd: require('path').dirname(process.cwd()),
            //         detached: true,
            //         stdio: "inherit"
            //     });
            //     //Don't wait for it
            //     child.unref();
            //     require('nw.gui').App.quit();
        } else {
            nw.Window.get().reload();
        }
    } else {
        toast.info('restarting app in 5 seconds. once all tasks are done');
        await new Promise(resolve => setTimeout(resolve, 5000));
        restartApp();
    }
}
