import { type Context } from 'hono';
import type { HonoVariables } from '../../../../hono/HonoVariables';
import { type ErrorType } from '../../../../types/errors';
import { getMyRestaurants_Service } from './restaurant.my_restaurants.service';

// Controller for getting user's restaurants
export const getMyRestaurants_Handler = async (c: Context<HonoVariables>) => {
    return c.json({
        // old: await getMyRestaurants_Service_Old(c.get('USER')?.id!)
        data: await getMyRestaurants_Service(c.get('USER')?.id!, c.req.header()['host']),
        error: null as ErrorType
    }, 200);
} 