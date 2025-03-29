import type { TEAM_PERMISSIONS } from "@lib/consts";
import type { Context } from "hono";
import type { Next } from "hono";
import { KNOWN_ERROR } from "@lib/types/errors";
import { isUserStoreAdmin } from "@db/services/store.service";

export function createAdminCheckStore(
    permissions: (typeof TEAM_PERMISSIONS)[keyof typeof TEAM_PERMISSIONS][]
) {
    return async function (c: Context, next: Next) {
        const userId = c.get('USER')?.id;
        const storeId = c.req.param('storeId');
        if (!userId || !storeId) {
            throw new KNOWN_ERROR("Unauthorized", "UNAUTHORIZED");
        }
        const isAdmin = await isUserStoreAdmin(userId, storeId, permissions);
        if (!isAdmin) {
            throw new KNOWN_ERROR("Not admin", "UNAUTHORIZED");
        }
        await next();
    }
}
