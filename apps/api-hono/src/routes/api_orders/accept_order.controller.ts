import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";
import { acceptOrder } from "@api-hono/utils/orders/acceptOrder";

export const acceptOrder_SchemaValidator = zValidator('json', z.object({
    orderId: z.string(),
}));

export const acceptOrder_Handler = async (c: Context<
    HonoVariables,
    "/:storeId/accept_order",
    ValidatorContext<typeof acceptOrder_SchemaValidator>
>) => {
    const user = c.get("USER");
    const ipAddress = c.req.header()['x-forwarded-for'] || c.req.header()['x-real-ip'];
    const acceptedOrderResult = await acceptOrder(
        c.req.param('storeId'),
        c.req.valid('json').orderId,
        user?.id,
        ipAddress,
        'user'
    )
    return c.json({
        data: acceptedOrderResult,
        error: null as ErrorType
    }, 200);
}
