import { z } from 'zod';
import { type Context } from 'hono';
import { insertRestaurantSchema } from '../../db/schema/restaurant.schema';
import type { HonoVariables } from '../../hono/HonoVariables';
import { type ValidatorContext } from '../../hono/types/ValidatorContext';
import { createRestaurantService } from '../../db/services/restaurant.service';
import { type ErrorType, KNOWN_ERROR } from '../../types/errors';
import { validateCrossDomainTurnstile } from '../../utils/validateTurnstile';
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
    const { userId } = await validateCrossDomainTurnstile(turnstile, c);
    if (userId !== c.get('USER')?.id!) {
        throw new KNOWN_ERROR("Invalid user", "INVALID_USER");
    } else {
        return c.json({
            data: await createRestaurantService(userId, name),
            error: null as ErrorType
        }, 200);
    }
}