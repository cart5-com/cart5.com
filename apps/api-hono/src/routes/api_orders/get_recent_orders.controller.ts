import { type Context } from 'hono'
import { KNOWN_ERROR, type ErrorType } from '@lib/types/errors';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { getRecentOrders_Service } from '@db/services/order.service';

export const getRecentOrders_Route = async (c: Context<
    HonoVariables
>) => {
    const storeId = c.req.param('storeId');
    if (!storeId) {
        throw new KNOWN_ERROR("Store ID not found", "STORE_ID_NOT_FOUND");
    }
    return c.json({
        data: await getRecentOrders_Service(storeId),
        error: null as ErrorType
    }, 200);
}