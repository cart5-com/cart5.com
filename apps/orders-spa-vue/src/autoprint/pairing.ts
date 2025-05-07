import { autoprintApiClient, createAutoprintApiClient } from "@api-client/autoprint";
import { getHostname, getPrinters } from "./mainWindow";
import { generateOTPJsOnly } from "@api-hono/utils/generateRandomOtp";
import { createHmacSignature } from "./createHmacSignature";
const DEVICE_ID_KEY = "DEVICE_ID";
const DEVICE_SECRET_KEY = "DEVICE_SECRET_KEY";

export let deviceId = localStorage.getItem(DEVICE_ID_KEY);
export let deviceSecretKey = localStorage.getItem(DEVICE_SECRET_KEY);

if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
}

if (!deviceSecretKey) {
    deviceSecretKey = crypto.randomUUID();
    localStorage.setItem(DEVICE_SECRET_KEY, deviceSecretKey);
}

export const setStatus = (status: string, color: string = "black") => {
    document.querySelector<HTMLDivElement>('#pairing-status')!.innerHTML = `<span style="color: ${color};">${status}</span>`;
}
export const addStatus = (status: string, color: string = "black") => {
    document.querySelector<HTMLDivElement>('#pairing-status')!.innerHTML += `<br><span style="color: ${color};">${status}</span>`;
}

export const setPrinters = async () => {
    const printers = await getPrinters();
    const timestamp = Date.now();
    const message = `${deviceId!}-${timestamp}`;
    const signature = await createHmacSignature(message, deviceSecretKey!);

    const { data, error } = await (await autoprintApiClient.set_printers.$post({
        json: {
            printers
        }
    }, {
        headers: {
            'X-device-id': deviceId!,
            'X-timestamp': timestamp.toString(),
            'X-signature': signature,
        }
    })).json();
    if (error) {
        setStatus(`Failed to set printers: ${error.message}`, "red");
    }
    if (data) {
        addStatus(`send printers names: ${data === 1 ? "success" : "failed"}`);
    }
}

let eventSource: EventSource | null = null;
let timeOutId: NodeJS.Timeout | null = null;
export const onClickPairDevice = async () => {
    if (eventSource) {
        eventSource.close();
    }
    const name = getHostname();
    const otp = generateOTPJsOnly(6);

    const url = createAutoprintApiClient(`${window.location.origin}/__p_api/autoprint/`).pair_device.$url({
        query: {
            name,
            deviceId: deviceId!,
            secretKey: deviceSecretKey!,
            otp
        }
    })
    setStatus(`new pairing started...`);
    // wait for 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));
    eventSource = new EventSource(url.toString());
    eventSource.onopen = () => {
        setStatus(`one-time-pairing-code: <b style="font-size: 20px;">${otp}</b>`);
        setPrinters();
    }
    eventSource.onmessage = (event) => {
        if (event.data === 'ping') {
            return
        }
        try {
            const data = JSON.parse(event.data);
            console.log(data);
        } catch (error) {
            console.error(error);
        }
    };

    eventSource.onerror = (event) => {
        console.log(`Pairing Connection error`);
        console.log(event);
        eventSource?.close();
        setStatus(`Pairing failed. it will try again in 3 seconds`, "red");
        setTimeout(() => {
            onClickPairDevice();
        }, 3_000);
    };

    if (timeOutId) {
        clearTimeout(timeOutId);
    }
    timeOutId = setTimeout(() => {
        onClickPairDevice();
    }, 300_000); // 5 minutes
}