export const focusGlobalWindow = function () {
    if (typeof global === "undefined") {
        return;
    }
    if (!global.mainWindow) {
        return;
    }
    global.mainWindow.x = 40;
    global.mainWindow.y = 40;
    global.mainWindow.height = 600;
    global.mainWindow.width = 600;
    global.mainWindow.show();
    global.mainWindow.focus();
    global.mainWindow.requestAttention(3);
    // global.mainWindow.maximize();
    global.mainWindow.setAlwaysOnTop(true);
    setTimeout(function () {
        if (!global.mainWindow) {
            return;
        }
        global.mainWindow.x = 40;
        global.mainWindow.y = 40;
        global.mainWindow.height = 600;
        global.mainWindow.width = 600;
        global.mainWindow.show();
        global.mainWindow.setAlwaysOnTop(false);
        global.mainWindow.focus();
        // global.mainWindow.maximize();
        global.mainWindow.requestAttention(3);
    }, 1000);
}
