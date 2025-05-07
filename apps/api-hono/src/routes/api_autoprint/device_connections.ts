import { SSEStreamingApi } from 'hono/streaming';

// Define device info type
interface DeviceInfo {
    stream: SSEStreamingApi;
    name: string;
    deviceId: string;
    otp: string;
    timestamp: number;
    secretKey?: string;
    printers?: any[];
}

// Device connections store
export const device_Connections = new Map<string, DeviceInfo>();

export const sendNotificationToDevice = (deviceId: string, data: any) => {
    const deviceInfo = device_Connections.get(deviceId);
    if (deviceInfo) {
        try {
            deviceInfo.stream.writeSSE({
                data: JSON.stringify(data),
            });
        } catch (e) {
            console.error("stream error", deviceId);
            console.error(e);
            device_Connections.delete(deviceId);
        }
    }
};

export const findDeviceByOtp = (otp: string): DeviceInfo | undefined => {
    for (const [_, deviceInfo] of device_Connections.entries()) {
        if (deviceInfo.otp === otp) {
            return deviceInfo;
        }
    }
    return undefined;
};

export const findDeviceByDeviceId = (deviceId: string): DeviceInfo | undefined => {
    return device_Connections.get(deviceId);
};