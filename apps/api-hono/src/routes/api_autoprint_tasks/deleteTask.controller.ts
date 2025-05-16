import { type Context } from 'hono';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { deleteTask_Service, getAutoprintDeviceTask_Service } from '@db/services/autoprint.service';
import { KNOWN_ERROR, type ErrorType } from '@lib/types/errors';
import { acceptOrder_handler } from '@api-hono/utils/orders/acceptOrder';
import { getIpAddress } from '@api-hono/utils/ip_address';

export const deleteTask_Handler = async (c: Context<HonoVariables>) => {
    const deviceId = c.req.param('deviceId');
    const taskId = c.req.param('taskId');

    if (!deviceId) {
        throw new KNOWN_ERROR("Device ID not found", "DEVICE_ID_NOT_FOUND");
    }

    if (!taskId) {
        throw new KNOWN_ERROR("Task ID not found", "TASK_ID_NOT_FOUND");
    }

    const task = await getAutoprintDeviceTask_Service(taskId, deviceId, {
        autoAcceptOrderAfterPrint: true,
        orderId: true,
        storeId: true,
    });
    if (!task) {
        throw new KNOWN_ERROR("Task not found", "TASK_NOT_FOUND");
    }

    await deleteTask_Service(taskId, deviceId);
    if (task.autoAcceptOrderAfterPrint) {
        await acceptOrder_handler(task.storeId, task.orderId, undefined, getIpAddress(c), 'automatic_rule');
    }

    return c.json({
        data: "success",
        error: null as ErrorType
    });
}; 