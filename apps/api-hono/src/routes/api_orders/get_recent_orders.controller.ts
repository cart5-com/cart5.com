import { type Context } from 'hono'
import { KNOWN_ERROR, type ErrorType } from '@lib/types/errors';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { getRecentOrders_Service } from '@db/services/order.service';

export const getRecentOrders_Route = async (c: Context<
    HonoVariables
>) => {
    return c.json({
        data: await getRecentOrders_Service(c.req.param('storeId')),
        error: null as ErrorType
    }, 200);
}