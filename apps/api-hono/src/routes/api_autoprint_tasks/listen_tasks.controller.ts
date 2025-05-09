import { SSEStreamingApi, streamSSE } from 'hono/streaming'
import { type Context } from 'hono'
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { KNOWN_ERROR } from '@lib/types/errors';

// This is not scalable, but it is ok for now
// maybe we can create an internal webhook for this later?
const taskListenerDevices_Connections = new Map<string, SSEStreamingApi>()

export const sendNotificationToTaskListenerDevice = (deviceId: string, data: any) => {
    const stream = taskListenerDevices_Connections.get(deviceId);
    if (stream) {
        try {
            stream.writeSSE({
                data: JSON.stringify(data),
            })
        } catch (e) {
            console.error("stream error", deviceId, stream)
            console.error(e)
            // Remove the connection if there's an error
            taskListenerDevices_Connections.delete(deviceId)
        }
        return true;
    } else {
        // if offline, this is unexpected. warn store
        return false;
    }
}

export const listenTasks_Handler = async (c: Context<
    HonoVariables
>) => {
    const deviceId = c.req.param('deviceId');
    if (!deviceId) {
        throw new KNOWN_ERROR("Device ID not found", "DEVICE_ID_NOT_FOUND");
    }

    // If device already has a connection, close it
    if (taskListenerDevices_Connections.has(deviceId)) {
        throw new KNOWN_ERROR("Device already connected", "DEVICE_ALREADY_CONNECTED");
    }

    return streamSSE(
        c,
        async (stream) => {
            taskListenerDevices_Connections.set(deviceId, stream)
            let isActive = true

            stream.onAbort(() => {
                taskListenerDevices_Connections.delete(deviceId)
                isActive = false
            })

            while (isActive) {
                try {
                    stream.writeSSE({ data: 'ping' })
                } catch (e) {
                    isActive = false
                    taskListenerDevices_Connections.delete(deviceId)
                    break
                }
                await stream.sleep(30_000)
            }
        },
        (e, stream) => {
            taskListenerDevices_Connections.delete(deviceId)
            console.log('streamSSE onError!')
            console.error(e)
            stream.writeln('An error occurred!')
            return Promise.resolve()
        }
    )
}
