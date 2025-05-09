import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import { streamSSE } from 'hono/streaming';
import { device_pairing_connections, findPairingDeviceByOtp } from "./device_pairing_connections";
import { KNOWN_ERROR } from "@lib/types/errors";

export const pairDevice_SchemaValidator = zValidator('query', z.object({
    name: z.string(),
    deviceId: z.string(),
    // secretKey: z.string(),
    otp: z.string(),
}));

export const pairDevice_Handler = async (c: Context<
    HonoVariables,
    "/pair_device",
    ValidatorContext<typeof pairDevice_SchemaValidator>
>) => {
    const {
        name,
        deviceId,
        // secretKey,
        otp,
    } = c.req.valid('query');

    if (device_pairing_connections.has(deviceId)) {
        throw new KNOWN_ERROR("device_id_conflict", "DEVICE_CONFLICT");
    }
    if (findPairingDeviceByOtp(otp)) {
        throw new KNOWN_ERROR("device_id_conflict", "DEVICE_CONFLICT");
    }

    return streamSSE(
        c,
        async (stream) => {
            // Store the connection with complete device info
            device_pairing_connections.set(deviceId, {
                stream,
                name,
                deviceId,
                // secretKey,
                otp,
                timestamp: Date.now(),
            });

            let isActive = true;
            stream.onAbort(() => {
                device_pairing_connections.delete(deviceId);
                isActive = false;
            });

            // Keep connection alive with ping
            while (isActive) {
                try {
                    stream.writeSSE({ data: 'ping' });
                } catch (e) {
                    isActive = false;
                    device_pairing_connections.delete(deviceId);
                    break;
                }
                await stream.sleep(30_000);
            }
        },
        (e, stream) => {
            device_pairing_connections.delete(deviceId);
            console.error('SSE error in device pairing:', e);
            stream.writeln('Connection error!');
            return Promise.resolve();
        }
    );
};
