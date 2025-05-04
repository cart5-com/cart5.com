import { SSEStreamingApi, streamSSE } from 'hono/streaming'
import { type Context } from 'hono'
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { KNOWN_ERROR } from '@lib/types/errors';

const stores_Connections = new Map<string, Map<string, SSEStreamingApi>>()

export const sendNotifyToStore = (storeId: string, data: any) => {
    const storeConnections = stores_Connections.get(storeId);
    if (storeConnections) {
        storeConnections.forEach((stream) => {
            try {
                stream.writeSSE({
                    data: JSON.stringify(data),
                })
            } catch (e) {
                console.error("stream error", storeId, stream)
                console.error(e)
            }
        });
    }
}

export const notifyStore_Handler = async (c: Context<
    HonoVariables
>) => {
    const storeId = c.req.param('storeId');
    if (!storeId) {
        throw new KNOWN_ERROR("Store ID not found", "STORE_ID_NOT_FOUND");
    }
    if (stores_Connections.get(storeId)?.size &&
        stores_Connections.get(storeId)!.size >= 100
    ) {
        throw new KNOWN_ERROR("Too many connections", "TOO_MANY_CONNECTIONS");
    }
    const clientId = crypto.randomUUID()
    return streamSSE(
        c,
        async (stream) => {
            if (!stores_Connections.has(storeId)) {
                stores_Connections.set(storeId, new Map())
            }
            stores_Connections.get(storeId)?.set(clientId, stream)
            let isActive = true
            stream.onAbort(() => {
                stores_Connections.get(storeId)?.delete(clientId)
                // Clean up empty maps
                if (stores_Connections.get(storeId)?.size === 0) {
                    stores_Connections.delete(storeId)
                }
                isActive = false
            })
            while (isActive) {
                try {
                    stream.writeSSE({ data: 'ping' })
                } catch (e) {
                    isActive = false
                    break
                }
                await stream.sleep(30_000)
            }
        },
        (e, stream) => {
            stores_Connections.get(storeId)?.delete(clientId)
            console.log('streamSSE onError!')
            console.error(e)
            stream.writeln('An error occurred11!')
            return Promise.resolve()
        }
    )
}

// export const notifyStore_Handler = async (c: Context<
//     HonoVariables
// >) => {
//     const storeId = c.req.param('storeId');
//     if (!storeId) {
//         throw new KNOWN_ERROR("Store ID not found", "STORE_ID_NOT_FOUND");
//     }

//     return streamSSE(
//         c,
//         async (stream: SSEStreamingApi) => {
//             // await stream.write(
//             //     new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f])
//             // )
//             // while (true) {
//             //     const message = `It is ${new Date().toISOString()}`
//             //     await stream.writeSSE({
//             //         data: message,
//             //         event: 'time-update',
//             //         id: String(),
//             //     })
//             //     await stream.sleep(1000)
//             // }

//         },
//         (e, stream) => {
//             console.log('streamSSE onError!')
//             console.error(e)
//             stream.writeln('An error occurred!')
//             return Promise.resolve()
//         }
//     )
// }