import { type Context } from 'hono';
import type { HonoVariables } from '@api-hono/types/HonoVariables';
import { type ErrorType } from '@lib/types/errors';
import { getAllRestaurantsThatUserHasAccessTo } from '@db/services/restaurant.service';

export const getMyRestaurants_Handler = async (c: Context<HonoVariables>) => {
    return c.json({
        data: await getAllRestaurantsThatUserHasAccessTo(
            c.get('USER')?.id!
        ),
        error: null as ErrorType
    }, 200);
} 