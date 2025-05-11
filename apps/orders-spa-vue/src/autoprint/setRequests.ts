import { getPrinters } from "./utils/getPrinters";
import { toast } from "@/ui-plus/sonner";
import { deviceId, deviceSecretKey } from "./pairing";
import { autoprintPairingApiClient } from "@api-client/autoprint_pairing";
import { generateSignatureHeaders } from "./utils/generateSignatureHeaders";

export const setPrinters = async () => {
    const { error } = await (await autoprintPairingApiClient.set_printers.$post({
        json: {
            printers: await getPrinters()
        }
    }, {
        headers: await generateSignatureHeaders()
    })).json();
    if (error) {
        toast.error(`Failed to set printers: ${error.message} please restart the app`);
    }
    // if (data) {
    //     addStatus(`send printers names: ${data === 1 ? "success" : "failed"}`);
    // }
}

export const setSecret = async () => {
    const { error } = await (await autoprintPairingApiClient.set_secret.$post({
        json: {
            secretKey: deviceSecretKey!
        }
    }, {
        headers: {
            'X-device-id': deviceId!,
        }
    })).json();
    if (error) {
        toast.error(`Failed to set secret: ${error.message} please restart the app`);
    }
    // if (data) {
    //     addStatus(`send secret: ${data === 1 ? "success" : "failed"}`);
    // }
}