let alwaysTopOnWindow: NWJS_Helpers.win | undefined;
export const openAlwaysTopOnWindow = function () {
    if (typeof global === "undefined") {
        return;
    }
    // global.mainWindow.setShowInTaskbar(true);
    // focusGlobalWindow();
    if (alwaysTopOnWindow) {
        return;
    }
    nw.Window.open(window.location.href.replace('autoprint.html', 'always_top_on.html'), {
        // "max_width": 60,
        // "max_height": 40,
        "width": 60,
        "height": 40,
        "show": true,
        "frame": false,
        // "transparent": true,
        // "fullscreen": true,
    }, function (win) {
        if (win) {
            alwaysTopOnWindow = win;
            win.x = 220;
            win.y = 0;
            if (import.meta.env.DEV) {
                win.y = 40;
            }
            // win.width = 60;
            // win.height = 40;

            win.setAlwaysOnTop(true);
            // win.setMaximumSize(60, 40);
            // win.setMinimumSize(60, 40);
            win.setResizable(false);

            alwaysTopOnWindow.on('minimize', function () {
                console.log('minimize');
                alwaysTopOnWindow?.restore();
            });

            alwaysTopOnWindow?.on('closed', function () {
                // do nothing
            });
            alwaysTopOnWindow?.on('close', function () {
                // do nothing
            });

            if (alwaysTopOnWindow.canSetVisibleOnAllWorkspaces()) {
                alwaysTopOnWindow.setVisibleOnAllWorkspaces(true);
            }
            alwaysTopOnWindow?.focus();
            setTimeout(function () {
                alwaysTopOnWindow?.setAlwaysOnTop(true);
                alwaysTopOnWindow?.focus();
            }, 500);
        } else {
            alert('AutoPrint UNDEFINED ERROR please restart the AutoPrint app');
        }
    });
}