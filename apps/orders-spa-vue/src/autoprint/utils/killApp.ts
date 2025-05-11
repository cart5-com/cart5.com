import { toast } from "@/ui-plus/sonner";
import { currentPrintTasks } from "../listenTasks";

export const killApp = async function () {
    if (currentPrintTasks.value.length === 0) {
        if (typeof global === "undefined") {
            toast.info('simulating kill app');
            return;
        }
        if (import.meta.env.DEV || prompt("please enter '123' to close the app") === "123") {
            if (typeof global !== "undefined") {
                require('nw.gui').App.quit();
            }
        } else {
            alert("wrong password");
        }
    } else {
        toast.info('killing app in 5 seconds. once all tasks are done');
        await new Promise(resolve => setTimeout(resolve, 5000));
        killApp();
    }
}