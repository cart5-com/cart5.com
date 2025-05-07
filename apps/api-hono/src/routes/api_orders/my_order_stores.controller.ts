import { type Context } from 'hono';
import type { HonoVariables } from '@api-hono/types/HonoVariables';
import { type ErrorType } from '@lib/types/errors';
import { getAllStoresThatUserHasAccessTo } from '@db/services/store.service';
import { getAutoprintDevices_ByStoreIds_Service_old } from '@db/services/autoprint.service';

export const getMyOrderStores_Handler = async (c: Context<HonoVariables>) => {
    const stores: {
        id: string;
        name: string;
        address1: string | null;
    }[] = await getAllStoresThatUserHasAccessTo(
        c.get('USER')?.id!
    )
    const autoprintDevices = await getAutoprintDevices_ByStoreIds_Service_old(stores.map(store => store.id));
    return c.json({
        data: stores.map(store => {
            return {
                ...store,
                autoprintDevices: autoprintDevices.find(s => s.storeId === store.id)?.devices
            }
        }),
        error: null as ErrorType
    }, 200);
} 