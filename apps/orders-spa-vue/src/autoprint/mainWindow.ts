

export const getMainWindow = function () {
    return nw.Window.get();
}

export const printMainWindow = function () {
    return nw.Window.get().print({

    });
}

export const getHostname = function () {
    try {
        return `${require('os').hostname()}-${Date.now()}`;
    } catch (error) {
        // Fallback to browser API if running in browser environment
        const name = navigator.userAgent.substring(navigator.userAgent.indexOf('(') + 1, navigator.userAgent.indexOf(')')) || window.location.hostname || 'unknown-device';
        return `${name}-${Date.now()}`;
    }
}

export const getPrinters = function (): Promise<any[] | undefined> {
    return new Promise((resolve) => {
        try {
            nw.Window.get().getPrinters(function (printers?: any[]) {
                console.log("result");
                console.log(printers);
                resolve(printers);
            });
        } catch (error) {
            console.log(error);
            console.warn("Failed to get printers, using fake printers");
            // fake it until make it
            resolve([
                {
                    "deviceName": "fake-printer",
                    "printerDescription": "",
                    "printerName": "fake-printer",
                    "printerOptions": {
                        "printer-location": "",
                        "printer-make-and-model": "",
                        "system_driverinfo": ""
                    }
                },
                {
                    // will save to app's local storage or app path as a PDF file
                    "deviceName": "Print to PDF (Mac Desktop)",
                    "printerDescription": "",
                    "printerName": "Print to PDF (Mac Desktop)",
                    "printerOptions": {
                        "printer-location": "",
                        "printer-make-and-model": "BLABLA Color JetLaser 8500 PS",
                        "system_driverinfo": "BLABLA Color JetLaser 8500 PS;6.0.6000.16386 (vista_rtm.061101-2205);Microsoft® Windows® Operating System;6.0.6000.16386"
                    }
                },
                {
                    "deviceName": "XP-80",
                    "printerDescription": "",
                    "printerName": "XP-80",
                    "printerOptions": {
                        "printer-location": "",
                        "printer-make-and-model": "XP-80",
                        "system_driverinfo": "XP-80;6.0.6001.22116 (vistasp1_ldr.080215-1730);Microsoft® Windows® Operating System;6.0.6001.22116"
                    }
                }
            ]);
        }
    });
}