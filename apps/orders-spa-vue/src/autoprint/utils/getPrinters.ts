import { currentPrinters } from "../stores/currentPrinters";

export const getPrinters = function (): Promise<any[] | undefined> {
    return new Promise((resolve) => {
        if (typeof global !== "undefined") {
            nw.Window.get().getPrinters(function (printers?: any[]) {
                console.log("result");
                console.log(printers);
                currentPrinters.value = printers || [];
                resolve(printers);
            });
        } else {
            console.warn("Failed to get printers, using fake printers");
            // fake it until make it
            const fakePrinters = [
                {
                    "deviceName": "fake-printer",
                    "printerDescription": "",
                    "printerName": "fake-printer",
                    "printerOptions": {
                        "printer-location": "",
                        "printer-make-and-model": "",
                        "system_driverinfo": ""
                    }
                }
            ];
            currentPrinters.value = fakePrinters;
            resolve(fakePrinters);
        }
    });
}

getPrinters();