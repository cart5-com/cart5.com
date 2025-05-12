import { type Context } from 'hono'
import { KNOWN_ERROR, type ErrorType } from '@lib/types/errors';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { getUserOrderData_Service } from '@db/services/order.service';
import { getStoreData_CacheJSON } from '@db/cache_json/store.cache_json';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { ValidatorContext } from '@api-hono/types/ValidatorContext';

export const getOrder_SchemaValidator = zValidator('query', z.object({
    checkStripePaymentStatus: z.boolean().optional(),
}))

export const getOrderRoute = async (
    c: Context<
        HonoVariables,
        "/:orderId/get_order",
        ValidatorContext<typeof getOrder_SchemaValidator>
    >
) => {
    const orderId = c.req.param('orderId');
    const { checkStripePaymentStatus } = c.req.valid('query');
    if (!orderId) {
        throw new KNOWN_ERROR("Order ID not found", "ORDER_ID_NOT_FOUND");
    }
    const host = c.req.header()['host'];
    if (!host) {
        throw new KNOWN_ERROR("Host not found", "HOST_NOT_FOUND");
    }
    const user = c.get("USER");
    if (!user || !user.id) {
        throw new KNOWN_ERROR("User not found", "USER_NOT_FOUND");
    }
    // TODO: should I select only userId to check permission/ then select all fields?
    const order = await getUserOrderData_Service(orderId, user.id);
    if (!order) {
        throw new KNOWN_ERROR("Order not found", "ORDER_NOT_FOUND");
    }
    if (order.userId !== user.id) {
        throw new KNOWN_ERROR("Permission denied", "PERMISSION_DENIED");
    }

    return c.json({
        data: order,
        error: null as ErrorType
    }, 200);
}