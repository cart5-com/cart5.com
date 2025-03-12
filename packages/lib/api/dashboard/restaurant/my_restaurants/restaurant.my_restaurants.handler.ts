import { type Context } from 'hono';
import type { HonoVariables } from '../../../../hono/HonoVariables';
import { type ErrorType } from '../../../../types/errors';
import { getMyRestaurants_Service } from './restaurant.my_restaurants.service';

// Controller for getting user's restaurants
export const getMyRestaurants_Handler = async (c: Context<HonoVariables>) => {
    return c.json({
        data: await getMyRestaurants_Service(c.get('USER')?.id!),
        error: null as ErrorType
    }, 200);
} 