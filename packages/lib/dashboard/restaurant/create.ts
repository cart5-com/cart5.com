import { z } from 'zod';
import { type Context } from 'hono';
import { insertRestaurantSchema } from '../../db/schema/restaurant.schema';
import type { HonoVariables } from '../../hono/HonoVariables';
import { getEnvVariable } from '../../utils/getEnvVariable';
import { type ValidatorContext } from '../../hono/types/ValidatorContext';
import { createRestaurantService } from '../../db/services/restaurant.service';
import { type ErrorType } from '../../types/errors';
import { validateTurnstile } from '../../utils/validateTurnstile';
import { zValidator } from '@hono/zod-validator';


export const createRestaurantSchemaValidator = zValidator('form', z.object({
    name: insertRestaurantSchema.shape.name,
    turnstile: z.string().min(1, { message: "Verification required" })
}))
export const createRestaurant = async (c: Context<
    HonoVariables,
    "/create-restaurant",
    ValidatorContext<typeof createRestaurantSchemaValidator>
>) => {
    const { name, turnstile } = c.req.valid('form');
    await validateTurnstile(getEnvVariable("TURNSTILE_SECRET"), turnstile, c.req.header()['x-forwarded-for']);
    const userId = c.get('USER')?.id!;
    return c.json({
        data: await createRestaurantService(userId, name),
        error: null as ErrorType
    }, 200);
}