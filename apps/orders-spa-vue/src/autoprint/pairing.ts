import { createAutoprintPairingApiClient } from "@api-client/autoprint_pairing";
import { toast } from "@/ui-plus/sonner";
import { getHostname } from "./utils/mainWindow";
import { generateOTPJsOnly } from "@api-hono/utils/generateRandomOtp";
import { ref } from "vue";
import { isPairedBefore } from "./stores/isPairedBefore";
import { listenTasks } from "./listenTasks";
import { globalErrorText } from "./stores/globalErrorText";
import { setPrinters, setSecret } from "./setRequests";

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

let eventSource: EventSource | null = null;
let timeOutId: NodeJS.Timeout | null = null;
export const isPairing = ref(false);
export const pairingCode = ref('');



export const stopPairing = () => {
    if (isPairing.value === false) {
        return;
    }
    isPairing.value = false;
    if (eventSource) {
        eventSource.close();
        eventSource = null;
        toast.info('Pairing stopped');
    }
    if (timeOutId) {
        clearTimeout(timeOutId);
        timeOutId = null;
    }
}

export const onClickPairDevice = async () => {
    if (eventSource) {
        eventSource.close();
    }

    pairingCode.value = '';
    isPairing.value = true;

    const name = getHostname();
    const otp = generateOTPJsOnly(6);
    const url = createAutoprintPairingApiClient(`${window.location.origin}/__p_api/autoprint_pairing/`).pair_device.$url({
        query: {
            name,
            deviceId: deviceId!,
            otp
        }
    })
    toast.info('new pairing started...');
    // wait for 1 second
    // await new Promise(resolve => setTimeout(resolve, 1000));
    eventSource = new EventSource(url.toString());
    eventSource.onopen = async () => {
        pairingCode.value = otp;
        toast.info(`one-time-pairing-code: ${otp}`);
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
                setTimeout(() => {
                    toast.success(`now you can close this window, PAIRED TO STORE: ${data.storeName}`);
                }, 1000);
                pairingCode.value = '';
                isPairedBefore.value = true;
                if (timeOutId) {
                    clearTimeout(timeOutId);
                    timeOutId = null;
                }
                eventSource?.close();
                eventSource = null;
                isPairing.value = false;
                listenTasks();
            }
        } catch (error) {
            console.error(error);
        }
    };

    eventSource.onerror = (event) => {
        globalErrorText.value = 'Pairing failed. it will try again in 10 seconds';
        console.log(`Pairing Connection error`);
        console.log(event);
        eventSource?.close();
        eventSource = null;

        if (!isPairing.value) return;

        toast.error(`Pairing failed. it will try again in 10 seconds`);
        setTimeout(() => {
            if (isPairing.value) {
                onClickPairDevice();
            }
        }, 10_000);
    };

    if (timeOutId) {
        clearTimeout(timeOutId);
    }
    timeOutId = setTimeout(() => {
        stopPairing();
    }, 300_000); // 5 minutes
}