import { autoprintPairingApiClient, createAutoprintPairingApiClient } from "@api-client/autoprint_pairing";
import { getHostname, getPrinters } from "./mainWindow";
import { generateOTPJsOnly } from "@api-hono/utils/generateRandomOtp";
import { createHmacSignature } from "./createHmacSignature";
const DEVICE_ID_KEY = "DEVICE_ID";
const DEVICE_SECRET_KEY = "DEVICE_SECRET_KEY";

export let deviceId = localStorage.getItem(DEVICE_ID_KEY);
export let deviceSecretKey = localStorage.getItem(DEVICE_SECRET_KEY);

console.log("pairing.ts running🟪🟪🟪");

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
        setStatus(`Failed to set printers: ${error.message}`, "red");
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
        setStatus(`Failed to set secret: ${error.message}`, "red");
    }
    // if (data) {
    //     addStatus(`send secret: ${data === 1 ? "success" : "failed"}`);
    // }
}

let eventSource: EventSource | null = null;
let timeOutId: NodeJS.Timeout | null = null;
let isPairing = false;

export const stopPairing = () => {
    if (eventSource) {
        eventSource.close();
        eventSource = null;
    }

    if (timeOutId) {
        clearTimeout(timeOutId);
        timeOutId = null;
    }

    isPairing = false;
    setStatus('Pairing stopped', 'blue');

    // Hide stop button, show pair button
    const stopButton = document.querySelector<HTMLButtonElement>('#stop-pairing');
    const pairButton = document.querySelector<HTMLButtonElement>('#pair-device');

    if (stopButton) stopButton.style.display = 'none';
    if (pairButton) pairButton.style.display = 'inline-block';
}

export const onClickPairDevice = async () => {
    if (eventSource) {
        eventSource.close();
    }

    isPairing = true;

    // Show stop button, hide pair button
    const stopButton = document.querySelector<HTMLButtonElement>('#stop-pairing');
    const pairButton = document.querySelector<HTMLButtonElement>('#pair-device');

    if (stopButton) stopButton.style.display = 'inline-block';
    if (pairButton) pairButton.style.display = 'none';

    const name = getHostname();
    const otp = generateOTPJsOnly(6);

    const url = createAutoprintPairingApiClient(`${window.location.origin}/__p_api/autoprint_pairing/`).pair_device.$url({
        query: {
            name,
            deviceId: deviceId!,
            otp
        }
    })
    setStatus(`new pairing started...`);
    // wait for 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));
    eventSource = new EventSource(url.toString());
    eventSource.onopen = async () => {
        setStatus(`one-time-pairing-code: <b style="font-size: 20px;">${otp}</b>`);
        await setSecret();
        await setPrinters();
    }
    eventSource.onmessage = (event) => {
        if (event.data === 'ping') {
            return
        }
        try {
            const data = JSON.parse(event.data);
            console.log(data);
            if (data.status === "SUCCESS") {
                setStatus(`PAIRED TO STORE: ${data.storeName}`, "green");
                addStatus(`now you can close this window`, "green");
                const isOnlineCheckbox = document.querySelector<HTMLInputElement>('#is-online-checkbox');
                if (isOnlineCheckbox) {
                    isOnlineCheckbox.checked = true;
                    // fire event to save
                    isOnlineCheckbox.dispatchEvent(new Event('change'));
                }
                if (timeOutId) {
                    clearTimeout(timeOutId);
                    timeOutId = null;
                }
                eventSource?.close();
                eventSource = null;
                isPairing = false;

                // Hide stop button, show pair button
                const stopButton = document.querySelector<HTMLButtonElement>('#stop-pairing');
                const pairButton = document.querySelector<HTMLButtonElement>('#pair-device');

                if (stopButton) stopButton.style.display = 'none';
                if (pairButton) pairButton.style.display = 'inline-block';
            }
        } catch (error) {
            console.error(error);
        }
    };

    eventSource.onerror = (event) => {
        console.log(`Pairing Connection error`);
        console.log(event);
        eventSource?.close();
        eventSource = null;

        if (!isPairing) return;

        setStatus(`Pairing failed. it will try again in 3 seconds`, "red");
        setTimeout(() => {
            if (isPairing) {
                onClickPairDevice();
            }
        }, 3_000);
    };

    if (timeOutId) {
        clearTimeout(timeOutId);
    }
    timeOutId = setTimeout(() => {
        if (isPairing) {
            onClickPairDevice();
        }
    }, 300_000); // 5 minutes
}