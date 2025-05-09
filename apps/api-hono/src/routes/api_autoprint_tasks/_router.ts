import { Hono } from 'hono';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { createHmac, timingSafeEqual } from 'crypto';
import { KNOWN_ERROR } from "@lib/types/errors";
import { getAutoPrintDevice_Service } from '@db/services/autoprint.service';
import { listenTasks_Handler } from './listen_tasks.controller';
import { getTasks_Handler } from './getTasks.controller';
import { deleteTask_Handler } from './deleteTask.controller';

export const apiAutoprintTasks = new Hono<HonoVariables>()
    .use(async (c, next) => {
        // almost same as pairing middleware but this one uses db to get secretKey not memory
        const deviceId = c.req.header()['x-device-id'];
        const timestamp = c.req.header()['x-timestamp'];
        const nonce = c.req.header()['x-nonce'];
        if (Date.now() - Number(timestamp) > 5 * 60 * 1000) {
            throw new KNOWN_ERROR("timestamp_expired", "TIMESTAMP_EXPIRED");
        }
        const signatureHeader = c.req.header()['x-signature'];
        if (!deviceId || !timestamp || !signatureHeader) {
            throw new KNOWN_ERROR("missing_headers", "UNAUTHORIZED");
        }
        const deviceInfo = await getAutoPrintDevice_Service(deviceId, {
            secretKey: true
        });
        if (!deviceInfo || !deviceInfo.secretKey) {
            throw new KNOWN_ERROR("device_not_found", "DEVICE_NOT_FOUND");
        }
        const message = `${deviceId}-${timestamp}-${nonce}`;
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
    })
    .get(
        '/listen/:deviceId',
        listenTasks_Handler
    )
    .get(
        '/tasks/:deviceId',
        getTasks_Handler
    )
    .delete(
        '/tasks/:deviceId/:taskId',
        deleteTask_Handler
    )

export type ApiAutoprintTasksType = typeof apiAutoprintTasks;


