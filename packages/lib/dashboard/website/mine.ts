import { type Context } from 'hono';
import { type ErrorType } from '../../types/errors';
import { getUserWebsitesService } from '../../db/services/team.service';
export const getMyWebsites = async (c: Context) => {
    const userId = c.get('USER')?.id!;
    return c.json({
        data: await getUserWebsitesService(userId),
        error: null as ErrorType
    }, 200);
} 