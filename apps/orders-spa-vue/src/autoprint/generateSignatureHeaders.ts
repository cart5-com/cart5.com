import { createHmacSignature } from "./createHmacSignature";
import { deviceId, deviceSecretKey } from "./pairing";

export const generateSignatureHeaders = async () => {
    const timestamp = Date.now();
    const nonce = crypto.randomUUID();
    const message = `${deviceId!}-${timestamp}-${nonce}`;
    const signature = await createHmacSignature(message, deviceSecretKey!);
    return {
        'X-device-id': deviceId!,
        'X-timestamp': timestamp.toString(),
        'X-nonce': nonce,
        'X-signature': signature
    }
}
