import { type Context } from 'hono';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { deleteTask_Service } from '@db/services/autoprint.service';
import { KNOWN_ERROR, type ErrorType } from '@lib/types/errors';

export const deleteTask_Handler = async (c: Context<HonoVariables>) => {
    const deviceId = c.req.param('deviceId');
    const taskId = c.req.param('taskId');

    if (!deviceId) {
        throw new KNOWN_ERROR("Device ID not found", "DEVICE_ID_NOT_FOUND");
    }

    if (!taskId) {
        throw new KNOWN_ERROR("Task ID not found", "TASK_ID_NOT_FOUND");
    }

    await deleteTask_Service(taskId, deviceId);

    return c.json({
        data: "success",
        error: null as ErrorType
    });
}; 