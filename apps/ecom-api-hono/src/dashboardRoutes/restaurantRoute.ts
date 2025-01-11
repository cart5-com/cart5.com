import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { Hono } from "hono";
import type { honoTypes } from "../index";
import { type ErrorType } from "lib/errors";
import { createRestaurant, getUserRestaurants } from "../db/db-actions/restaurant";
import { validateTurnstile } from 'lib/utils/validateTurnstile';
import { env } from 'hono/adapter';

export const restaurantRoute = new Hono<honoTypes>()
    .get('/my-restaurants', async (c) => {
        const restaurants = await getUserRestaurants(c, { userId: c.get('USER')?.id! });
        return c.json({
            data: restaurants,
            error: null as ErrorType
        }, 200);
    })
    .post(
        '/create-restaurant',
        zValidator('form', z.object({
            name: z.string().max(255),
            turnstile: z.string().min(1, { message: "Verification required" })
        })),
        async (c) => {
            const { name, turnstile } = c.req.valid('form');
            await validateTurnstile(env(c).TURNSTILE_SECRET, turnstile, c.req.header()['x-forwarded-for']);
            return c.json({
                data: await createRestaurant(c, {
                    name,
                    userId: c.get('USER')?.id!
                }),
                error: null as ErrorType
            }, 200);
        }
    )