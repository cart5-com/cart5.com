import { type Context } from 'hono'
import { KNOWN_ERROR, type ErrorType } from '@lib/types/errors';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { generateOrderData_Service, updateOrderData_Service } from '@db/services/order.service';
import { generateKey } from '@lib/utils/generateKey';

export const placeOrderRoute = async (c: Context<
    HonoVariables
>) => {
    const storeId = c.req.param('storeId');
    if (!storeId) {
        throw new KNOWN_ERROR("Store ID not found", "STORE_ID_NOT_FOUND");
    }
    const host = c.req.header()['host'];
    if (!host) {
        throw new KNOWN_ERROR("Host not found", "HOST_NOT_FOUND");
    }
    const origin = c.req.header()['origin'];
    if (!origin) {
        throw new KNOWN_ERROR("Origin not found", "ORIGIN_NOT_FOUND");
    }
    const user = c.get("USER");
    if (!user || !user.id) {
        throw new KNOWN_ERROR("User not found", "USER_NOT_FOUND");
    }
    if (user.hasVerifiedPhoneNumber === 0) {
        throw new KNOWN_ERROR("User phone number not verified", "USER_PHONE_NUMBER_NOT_VERIFIED");
    }
    const order = await updateOrderData_Service(generateKey('ord'), await generateOrderData_Service(user, host, storeId));
    return c.json({
        data: order,
        error: null as ErrorType
    }, 200);
}