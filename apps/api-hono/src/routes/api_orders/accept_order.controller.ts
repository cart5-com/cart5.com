import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";
import { acceptOrder_handler } from "@api-hono/utils/orders/acceptOrder";
import { getIpAddress } from "@api-hono/utils/ip_address";
export const acceptOrder_SchemaValidator = zValidator('json', z.object({
    orderId: z.string(),
}));

export const acceptOrder_Controller = async (c: Context<
    HonoVariables,
    "/:storeId/accept_order",
    ValidatorContext<typeof acceptOrder_SchemaValidator>
>) => {
    const user = c.get("USER");
    const acceptedOrderResult = await acceptOrder_handler(
        c.req.param('storeId'),
        c.req.valid('json').orderId,
        user?.id,
        getIpAddress(c),
        'user'
    )
    return c.json({
        data: acceptedOrderResult,
        error: null as ErrorType
    }, 200);
}
