import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import { streamSSE } from 'hono/streaming';
import { device_Connections } from "./device_connections";

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

    if (device_Connections.has(deviceId)) {
        // Device already connected, reject the new connection attempt
        return c.json({
            error: "Device with this ID is already connected",
            data: null
        }, 409); // 409 Conflict status code
    }

    return streamSSE(
        c,
        async (stream) => {
            // Store the connection with complete device info
            device_Connections.set(deviceId, {
                stream,
                name,
                deviceId,
                // secretKey,
                otp,
                timestamp: Date.now(),
            });

            let isActive = true;
            stream.onAbort(() => {
                device_Connections.delete(deviceId);
                isActive = false;
            });

            // Keep connection alive with ping
            while (isActive) {
                try {
                    stream.writeSSE({ data: 'ping' });
                } catch (e) {
                    isActive = false;
                    device_Connections.delete(deviceId);
                    break;
                }
                await stream.sleep(30_000);
            }
        },
        (e, stream) => {
            device_Connections.delete(deviceId);
            console.error('SSE error in device pairing:', e);
            stream.writeln('Connection error!');
            return Promise.resolve();
        }
    );
};
