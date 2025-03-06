import { type Context } from 'hono';
import { getMyRestaurantsService } from '../../db/services/restaurant.service';
import { type ErrorType } from '../../errors';

export const getMyRestaurants = async (c: Context) => {
    const userId = c.get('USER')?.id!;
    return c.json({
        data: await getMyRestaurantsService(userId),
        error: null as ErrorType
    }, 200);
}