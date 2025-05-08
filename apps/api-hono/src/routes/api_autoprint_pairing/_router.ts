import { Hono } from 'hono';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { pairDevice_Handler, pairDevice_SchemaValidator } from './pair_device.controller';
import { setPrinters_SchemaValidator } from './set_printers.controller';
import { setPrinters_Handler } from './set_printers.controller';
import { createHmac, timingSafeEqual } from 'crypto';
import { KNOWN_ERROR } from "@lib/types/errors";
import { findPairingDeviceByDeviceId } from './device_pairing_connections';
import { setSecret_SchemaValidator } from './set_secret.controller';
import { setSecret_Handler } from './set_secret.controller';
import { paths } from '@api-hono/paths';

export const apiAutoprintPairing = new Hono<HonoVariables>()
    .use(async (c, next) => {
        // ignore pair_device
        if (c.req.path === `${paths.autoprint_pairing}/pair_device`) {
            return next();
        } else if (c.req.path === `${paths.autoprint_pairing}/set_secret`) {
            return next();
        } else {
            const deviceId = c.req.header()['x-device-id'];
            const timestamp = c.req.header()['x-timestamp'];
            if (Date.now() - Number(timestamp) > 5 * 60 * 1000) {
                throw new KNOWN_ERROR("timestamp_expired", "TIMESTAMP_EXPIRED");
            }
            const signatureHeader = c.req.header()['x-signature'];
            if (!deviceId || !timestamp || !signatureHeader) {
                throw new KNOWN_ERROR("missing_headers", "UNAUTHORIZED");
            }
            const deviceInfo = findPairingDeviceByDeviceId(deviceId);
            // **************** in memory, secretKey
            if (!deviceInfo || !deviceInfo.secretKey) {
                throw new KNOWN_ERROR("device_not_found", "DEVICE_NOT_FOUND");
            }
            const message = `${deviceId}-${timestamp}`;
            // ******************************************* in memory, secretKey
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
    .post(
        '/set_secret',
        setSecret_SchemaValidator,
        setSecret_Handler
    )

export type ApiAutoprintPairingType = typeof apiAutoprintPairing;


