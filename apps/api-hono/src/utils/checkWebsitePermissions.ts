import type { TEAM_PERMISSIONS } from "@lib/consts";
import type { Context } from "hono";
import type { Next } from "hono";
import { KNOWN_ERROR } from "@lib/types/errors";
import { isUserWebsiteAdmin } from "@db/services/website.service";

export function checkWebsitePermissions(
    permissions: (typeof TEAM_PERMISSIONS)[keyof typeof TEAM_PERMISSIONS][]
) {
    return async function (c: Context, next: Next) {
        const userId = c.get('USER')?.id;
        const websiteId = c.req.param('websiteId');
        if (!userId || !websiteId) {
            throw new KNOWN_ERROR("Unauthorized", "UNAUTHORIZED");
        }
        const isAdmin = await isUserWebsiteAdmin(userId, websiteId, permissions);
        if (!isAdmin) {
            throw new KNOWN_ERROR("Not admin", "UNAUTHORIZED");
        }
        await next();
    }
}
