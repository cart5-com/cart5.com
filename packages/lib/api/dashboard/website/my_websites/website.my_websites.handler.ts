import { type Context } from 'hono';
import type { HonoVariables } from '../../../../hono/HonoVariables';
import { type ErrorType } from '../../../../types/errors';
import {
    // getMyWebsites_Service,
    getMyWebsites_Service_Old
} from './website.my_websites.service';

/**
 * Controller for getting the user's websites
 */
export const getMyWebsites_Handler = async (c: Context<HonoVariables>) => {
    return c.json({
        data: await getMyWebsites_Service_Old(c.get('USER')?.id!),
        // data: await getMyWebsites_Service(c.get('USER')?.id!, c.req.header()['host']),
        error: null as ErrorType
    }, 200);
} 