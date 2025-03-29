import { type Context } from 'hono';
import type { HonoVariables } from '@api-hono/types/HonoVariables';
import { type ErrorType } from '@lib/types/errors';
import { getAllStoresThatUserHasAccessTo } from '@db/services/store.service';

export const getMyStores_Handler = async (c: Context<HonoVariables>) => {
    return c.json({
        data: await getAllStoresThatUserHasAccessTo(
            c.get('USER')?.id!
        ),
        error: null as ErrorType
    }, 200);
} 