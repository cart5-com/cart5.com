import { getPrinters } from "./utils/getPrinters";
import { toast } from "@/ui-plus/sonner";
import { deviceId, deviceSecretKey } from "./pairing";
import { createHmacSignature } from "@lib/utils/createHmacSignature";
import { autoprintPairingApiClient } from "@api-client/autoprint_pairing";

export const setPrinters = async () => {
    const printers = await getPrinters();
    const timestamp = Date.now();
    const nonce = crypto.randomUUID();
    const message = `${deviceId!}-${timestamp}-${nonce}`;
    const signature = await createHmacSignature(message, deviceSecretKey!);

    const { error } = await (await autoprintPairingApiClient.set_printers.$post({
        json: {
            printers
        }
    }, {
        headers: {
            'X-device-id': deviceId!,
            'X-timestamp': timestamp.toString(),
            'X-nonce': nonce,
            'X-signature': signature,
        }
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