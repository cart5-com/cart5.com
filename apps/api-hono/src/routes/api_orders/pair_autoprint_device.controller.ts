import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import { KNOWN_ERROR } from "@lib/types/errors";
import { findPairingDeviceByOtp, sendPairingNotificationToDevice } from "../api_autoprint_pairing/device_pairing_connections";
import type { ErrorType } from "@lib/types/errors";
import { updateAutoPrintDevice_Service, addAutoprintDeviceToStore_Service } from "@db/services/autoprint.service";
import { getStore_Service } from "@db/services/store.service";

export const pairAutoprintDevice_SchemaValidator = zValidator('json', z.object({
    otp: z.string().min(6).max(6),
}));

export const pairAutoprintDevice_Handler = async (c: Context<
    HonoVariables,
    "/:storeId/pair_autoprint_device",
    ValidatorContext<typeof pairAutoprintDevice_SchemaValidator>
>) => {
    const { otp } = c.req.valid('json');
    const deviceInfo = findPairingDeviceByOtp(otp.toUpperCase().trim());
    if (!deviceInfo || !deviceInfo.secretKey || !deviceInfo.deviceId || !deviceInfo.printers) {
        throw new KNOWN_ERROR("invalid_device", "INVALID_DEVICE");
    }
    const { secretKey, otp: _, stream, timestamp, ...rest } = deviceInfo;
    const storeId = c.req.param('storeId');
    const store = await getStore_Service(storeId, {
        name: true
    });
    sendPairingNotificationToDevice(deviceInfo.deviceId, {
        status: "SUCCESS",
        storeName: store?.name,
    })
    await updateAutoPrintDevice_Service(deviceInfo.deviceId, {
        name: deviceInfo.name,
        secretKey: deviceInfo.secretKey,
        printers: deviceInfo.printers,
    })
    await addAutoprintDeviceToStore_Service(deviceInfo.deviceId, storeId);

    return c.json({
        data: rest,
        error: null as ErrorType
    }, 200);
}
