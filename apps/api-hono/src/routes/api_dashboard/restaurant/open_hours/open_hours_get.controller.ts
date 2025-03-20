import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { selectRestaurantOpenHoursSchema } from "@db/schema/restaurant.schema";
import { getRestaurantOpenHours_Service } from "@db/services/restaurant.service";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";
import { isOpenNow } from "@lib/utils/isOpenNow";
export const getRestaurantOpenHours_SchemaValidator = zValidator('json', z.object({
    columns: z.object(
        Object.fromEntries(
            Object.keys(selectRestaurantOpenHoursSchema.shape)
                .map(key => [key, z.boolean().optional()])
        )
    )
}));

// Controller for getting restaurant open hours details
export const getRestaurantOpenHours_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId/open_hours",
    ValidatorContext<typeof getRestaurantOpenHours_SchemaValidator>
>) => {
    let data = await getRestaurantOpenHours_Service(c.req.param('restaurantId'), c.req.valid('json').columns)
    const isNowOpen = isOpenNow(data?.timezone ?? null, data?.defaultOpenHours ?? null);
    // @ts-ignore
    data.isNowOpenServerTime = isNowOpen;
    return c.json({
        data: data,
        error: null as ErrorType
    }, 200);
} 