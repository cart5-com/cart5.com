import { z } from 'zod';
import { type Context } from 'hono';
import type { HonoVariables } from '../../../../hono/HonoVariables';
import { type ValidatorContext } from '../../../../hono/types/ValidatorContext';
import { type ErrorType } from '../../../../types/errors';
import { validateCrossDomainTurnstile_WithUserCheck } from '../../../../utils/validateTurnstile';
import { zValidator } from '@hono/zod-validator';
import { createRestaurant_Service } from './restaurant.create.service';

// Schema validation for restaurant creation
export const createRestaurant_SchemaValidator = zValidator('form', z.object({
    name: z.string().min(3, { message: "min 3" }).max(510, { message: "max 510" }),
    turnstile: z.string().min(1, { message: "Verification required" })
}));

// Controller for restaurant creation
export const createRestaurant_Handler = async (c: Context<
    HonoVariables,
    "/create",
    ValidatorContext<typeof createRestaurant_SchemaValidator>
>) => {
    const { name, turnstile } = c.req.valid('form');

    // Validate turnstile and user
    const { userId } = await validateCrossDomainTurnstile_WithUserCheck(turnstile, c);
    return c.json({
        data: await createRestaurant_Service(userId, name),
        error: null as ErrorType
    }, 200);
} 