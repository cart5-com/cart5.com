import { type Context } from 'hono';
import type { HonoVariables } from '../../../../hono/HonoVariables';
import { type ErrorType, KNOWN_ERROR } from '../../../../types/errors';
import { getMyWebsites_Service } from './website.my_websites.service';

/**
 * Controller for getting the user's websites
 */
export const getMyWebsites_Handler = async (c: Context<HonoVariables>) => {
    const userId = c.get('USER')?.id;

    if (!userId) {
        throw new KNOWN_ERROR("Unauthorized", "UNAUTHORIZED");
    }

    try {
        // Call service to get user's websites
        const websites = await getMyWebsites_Service(userId);

        return c.json({
            data: websites,
            error: null as ErrorType
        }, 200);
    } catch (error) {
        if (error instanceof KNOWN_ERROR) {
            throw error;
        }
        throw new KNOWN_ERROR("Failed to get websites", "INTERNAL_SERVER_ERROR");
    }
} 