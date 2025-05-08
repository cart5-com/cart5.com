export const killApp = function () {
    if (typeof global === "undefined") {
        return;
    }
    if (import.meta.env.DEV || prompt("please enter '1234' to close the app") === "1234") {
        if (typeof global !== "undefined") {
            require('nw.gui').App.quit();
        }
    } else {
        alert("wrong password");
    }
}
