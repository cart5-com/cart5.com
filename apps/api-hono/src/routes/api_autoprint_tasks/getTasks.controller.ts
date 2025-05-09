import { type Context } from 'hono';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { getDeviceTasks_Service } from '@db/services/autoprint.service';
import { KNOWN_ERROR } from '@lib/types/errors';

export const getTasks_Handler = async (c: Context<HonoVariables>) => {
    const deviceId = c.req.param('deviceId');

    if (!deviceId) {
        throw new KNOWN_ERROR("Device ID not found", "DEVICE_ID_NOT_FOUND");
    }

    const tasks = await getDeviceTasks_Service(deviceId);

    return c.json({
        success: true,
        data: tasks
    });
};
