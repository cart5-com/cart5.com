import { type Context } from 'hono';
import type { HonoVariables } from '../../../../hono/HonoVariables';
import { type ErrorType } from '../../../../types/errors';
import { getMyTeams_Service } from './team.my_teams.service';

/**
 * Controller for getting the user's teams
 */
export const getMyTeams_Handler = async (c: Context<HonoVariables>) => {
    return c.json({
        data: await getMyTeams_Service(c.get('USER')?.id!, c.req.header()['host']),
        error: null as ErrorType
    }, 200);
} 