import { type Context } from 'hono';
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { setPrinters_Service } from '@db/services/autoprint.service';
import { KNOWN_ERROR, type ErrorType } from '@lib/types/errors';
import type { ValidatorContext } from '@api-hono/types/ValidatorContext';
import { printersSchema } from '@lib/zod/Printers';

export const setPrinters_SchemaValidator = zValidator('json', z.object({
    printers: printersSchema.optional()
}));

export const setPrinters_Handler = async (c: Context<
    HonoVariables,
    "/set_printers",
    ValidatorContext<typeof setPrinters_SchemaValidator>
>) => {
    const deviceId = c.req.header()['x-device-id'];
    const printers = c.req.valid('json').printers ?? [];
    if (!deviceId) {
        throw new KNOWN_ERROR("Device ID not found", "DEVICE_ID_NOT_FOUND");
    }
    await setPrinters_Service(deviceId, printers);
    return c.json({
        data: "success",
        error: null as ErrorType
    });
}; 