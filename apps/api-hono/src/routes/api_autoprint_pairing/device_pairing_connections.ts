import { SSEStreamingApi } from 'hono/streaming';
import { type PrintersType } from '@lib/zod/Printers';

// Define device info type
interface PairingDeviceInfo {
    stream: SSEStreamingApi;
    name: string;
    deviceId: string;
    otp: string;
    timestamp: number;
    secretKey?: string;
    printers?: PrintersType;
}
// This is not scalable, but it is ok for now
export const device_pairing_connections = new Map<string, PairingDeviceInfo>();

export const sendPairingNotificationToDevice = (deviceId: string, data: any) => {
    const deviceInfo = device_pairing_connections.get(deviceId);
    if (deviceInfo) {
        try {
            deviceInfo.stream.writeSSE({
                data: JSON.stringify(data),
            });
        } catch (e) {
            console.error("stream error", deviceId);
            console.error(e);
            device_pairing_connections.delete(deviceId);
        }
    }
};

export const findPairingDeviceByOtp = (otp: string): PairingDeviceInfo | undefined => {
    for (const [_, deviceInfo] of device_pairing_connections.entries()) {
        if (deviceInfo.otp === otp) {
            return deviceInfo;
        }
    }
    return undefined;
};

export const findPairingDeviceByDeviceId = (deviceId: string): PairingDeviceInfo | undefined => {
    return device_pairing_connections.get(deviceId);
};