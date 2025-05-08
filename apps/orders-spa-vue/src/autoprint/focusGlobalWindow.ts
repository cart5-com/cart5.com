export const focusGlobalWindow = function () {
    if (typeof global === "undefined") {
        return;
    }
    if (!global.mainWindow) {
        return;
    }
    global.mainWindow.x = 0;
    global.mainWindow.y = 0;
    global.mainWindow.height = 450;
    global.mainWindow.width = 350;
    global.mainWindow.show();
    global.mainWindow.focus();
    global.mainWindow.requestAttention(3);
    // global.mainWindow.maximize();
    global.mainWindow.setAlwaysOnTop(true);
    setTimeout(function () {
        if (!global.mainWindow) {
            return;
        }
        global.mainWindow.x = 0;
        global.mainWindow.y = 0;
        global.mainWindow.height = 450;
        global.mainWindow.width = 350;
        global.mainWindow.show();
        global.mainWindow.setAlwaysOnTop(false);
        global.mainWindow.focus();
        // global.mainWindow.maximize();
        global.mainWindow.requestAttention(3);
    }, 1000);
}
