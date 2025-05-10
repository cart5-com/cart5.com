export const getPrinters = function (): Promise<any[] | undefined> {
    return new Promise((resolve) => {
        if (typeof global !== "undefined") {
            nw.Window.get().getPrinters(function (printers?: any[]) {
                console.log("result");
                console.log(printers);
                resolve(printers);
            });
        } else {
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