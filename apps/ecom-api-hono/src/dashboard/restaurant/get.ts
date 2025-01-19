import { z } from 'zod';
import { type Context } from 'hono';
import { selectRestaurantAddressSchema, selectRestaurantSchema } from '../../db/schema/restaurant/restaurant.schema';
import type { HonoVariables } from '../../index';
import { type ValidatorContext } from 'lib/types/hono/ValidatorContext';
import { getRestaurantService } from '../../db/schema/restaurant/restaurant.service';
import { type ErrorType } from 'lib/errors';
import { zValidator } from '@hono/zod-validator';


export const getRestaurantSchemaValidator = zValidator('json', z.object({
    // columns?: Partial<Record<keyof typeof restaurantTable.$inferSelect, boolean>>,
    // TODO: fix typing
    columns: z.any()
    // z.record(z.enum(selectRestaurantSchema.keyof().options), z.boolean())
    //     .and(
    //         z.object({
    //             address: z.record(z.enum(
    //                 selectRestaurantAddressSchema.keyof().options
    //             ), z.boolean())
    //         }).partial()
    //     )
}))
export const getRestaurant = async (c: Context<
    HonoVariables,
    "/:restaurantId",
    ValidatorContext<typeof getRestaurantSchemaValidator>
>) => {
    // restaurantTable._.columns
    // columns ?: Partial<Record<keyof typeof restaurantTable.$inferSelect, boolean>>
    return c.json({
        data: await getRestaurantService(c.req.param('restaurantId'), c.req.valid('json').columns),
        error: null as ErrorType
    }, 200);
}