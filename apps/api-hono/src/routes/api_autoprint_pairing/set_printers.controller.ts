import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";
import { findPairingDeviceByDeviceId } from "./device_pairing_connections";
import { KNOWN_ERROR } from "@lib/types/errors";

export const setPrinters_SchemaValidator = zValidator('json', z.object({
    printers: z.array(z.any()).optional()
}));

// Controller for getting Store address details
export const setPrinters_Handler = async (c: Context<
    HonoVariables,
    "/set_printers",
    ValidatorContext<typeof setPrinters_SchemaValidator>
>) => {
    const deviceId = c.req.header('X-device-id');
    const printers = c.req.valid('json').printers;
    if (!deviceId) {
        throw new KNOWN_ERROR("device_not_found", "DEVICE_NOT_FOUND");
    }
    const deviceInfo = findPairingDeviceByDeviceId(deviceId);
    if (!deviceInfo) {
        throw new KNOWN_ERROR("device_not_found", "DEVICE_NOT_FOUND");
    }
    deviceInfo.printers = printers;
    return c.json({
        data: 1,
        error: null as ErrorType
    }, 200);
}
