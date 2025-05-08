import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";
import { findPairingDeviceByDeviceId } from "./device_pairing_connections";
import { KNOWN_ERROR } from "@lib/types/errors";

export const setSecret_SchemaValidator = zValidator('json', z.object({
    secretKey: z.string()
}));

// Controller for getting Store address details
export const setSecret_Handler = async (c: Context<
    HonoVariables,
    "/set_secret",
    ValidatorContext<typeof setSecret_SchemaValidator>
>) => {
    const { secretKey } = c.req.valid('json');
    const deviceId = c.req.header()['x-device-id'];
    if (!deviceId) {
        throw new KNOWN_ERROR("missing_headers", "UNAUTHORIZED");
    }
    if (!deviceId) {
        throw new KNOWN_ERROR("device_not_found", "DEVICE_NOT_FOUND");
    }
    const deviceInfo = findPairingDeviceByDeviceId(deviceId);
    if (!deviceInfo) {
        throw new KNOWN_ERROR("device_not_found", "DEVICE_NOT_FOUND");
    }
    if (!secretKey) {
        throw new KNOWN_ERROR("secret_key_not_found", "SECRET_KEY_NOT_FOUND");
    }
    if (Date.now() - deviceInfo.timestamp > 10_000) {
        throw new KNOWN_ERROR("expired", "EXPIRED");
    }
    if (deviceInfo.secretKey) {
        throw new KNOWN_ERROR("secret_key_already_set", "SECRET_KEY_ALREADY_SET");
    }
    deviceInfo.secretKey = secretKey;
    return c.json({
        data: 1,
        error: null as ErrorType
    }, 200);
}
