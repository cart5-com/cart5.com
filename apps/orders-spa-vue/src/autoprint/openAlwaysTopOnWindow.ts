
let alwaysTopOnWindow: NWJS_Helpers.win | undefined;
let iframe: HTMLIFrameElement | undefined;

export const openAlwaysTopOnWindow = function () {
    if (typeof global === "undefined") {
        // add it as iframe
        iframe = document.createElement('iframe');
        iframe.src = window.location.href.replace('autoprint.html', 'autoprint-alwaysTopOn.html');
        iframe.style.position = 'fixed';
        iframe.style.bottom = '0';
        iframe.style.right = '0';
        iframe.style.width = '60px';
        iframe.style.height = '25px';
        document.body.appendChild(iframe);
        return;
    }
    // global.mainWindow.setShowInTaskbar(true);
    // focusGlobalWindow();
    if (alwaysTopOnWindow) {
        return;
    }
    nw.Window.open(window.location.href.replace('autoprint.html', 'autoprint-alwaysTopOn.html'), {
        // "max_width": 60,
        // "max_height": 40,
        "width": 60,
        "height": 25,
        "show": true,
        "frame": false,
        // "transparent": true,
        // "fullscreen": false,
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

export const setOpenAlwaysTopOnWindowText = (text: string) => {
    if (typeof global === "undefined") {
        if (iframe) {
            const elem = iframe.contentWindow?.document.getElementById('is-online-status');
            if (elem) {
                elem.textContent = text;
            }
        }
        return;
    }
    if (alwaysTopOnWindow) {
        const elem = alwaysTopOnWindow.window.document.getElementById('is-online-status');
        if (elem) {
            elem.textContent = text;
        }
    }
}
