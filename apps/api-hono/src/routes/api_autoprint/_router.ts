import { Hono } from 'hono';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { pairDevice_Handler, pairDevice_SchemaValidator } from './pair_device.controller';
import { setPrinters_SchemaValidator } from './set_printers.controller';
import { setPrinters_Handler } from './set_printers.controller';
import { createHmac, timingSafeEqual } from 'crypto';
import { KNOWN_ERROR } from "@lib/types/errors";
import { findDeviceByDeviceId } from './device_connections';


export const apiAutoprint = new Hono<HonoVariables>()
    .use(async (c, next) => {
        // ignore pair_device
        if (c.req.path === '/autoprint/pair_device') {
            return next();
        } else {
            const deviceId = c.req.header('X-device-id');
            const timestamp = c.req.header('X-timestamp');
            if (Date.now() - Number(timestamp) > 5 * 60 * 1000) {
                throw new KNOWN_ERROR("timestamp_expired", "TIMESTAMP_EXPIRED");
            }
            const signatureHeader = c.req.header('X-signature');
            if (!deviceId || !timestamp || !signatureHeader) {
                throw new KNOWN_ERROR("missing_headers", "UNAUTHORIZED");
            }
            const deviceInfo = findDeviceByDeviceId(deviceId);
            if (!deviceInfo || !deviceInfo.secretKey) {
                throw new KNOWN_ERROR("device_not_found", "DEVICE_NOT_FOUND");
            }
            const message = `${deviceId}-${timestamp}`;
            const expectedSignature = createHmac('sha256', deviceInfo.secretKey)
                .update(message)
                .digest('hex');

            if (!timingSafeEqual(
                Buffer.from(signatureHeader, 'hex'),
                Buffer.from(expectedSignature, 'hex')
            )) {
                throw new KNOWN_ERROR("invalid_signature", "INVALID_SIGNATURE");
            }
            return next();
        }
    })
    .get(
        '/pair_device',
        pairDevice_SchemaValidator,
        pairDevice_Handler
    )
    .post(
        '/set_printers',
        setPrinters_SchemaValidator,
        setPrinters_Handler
    )

export type ApiAutoprintType = typeof apiAutoprint;


