import { type Context } from 'hono';
import { getMyWebsitesService } from '../../db/services/website.service';
import { type ErrorType } from '../../types/errors';

export const getMyWebsites = async (c: Context) => {
    const userId = c.get('USER')?.id!;
    return c.json({
        data: await getMyWebsitesService(userId),
        error: null as ErrorType
    }, 200);
} 