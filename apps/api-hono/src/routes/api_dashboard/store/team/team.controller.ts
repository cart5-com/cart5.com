import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ErrorType } from "@lib/types/errors";
import { getTeam_Service, getTeamMembers_Service } from "@db/services/team.service";
import { getStore_Service } from "@db/services/store.service";
import { redactEmail } from "@lib/utils/redactEmail";
import { getWebsiteByOwnerTeamId_Service } from "@db/services/website.service";

export const getStoreTeamMembers_Handler = async (c: Context<
    HonoVariables,
    "/:storeId/team"
>) => {
    const store = await getStore_Service(c.req.param('storeId'), {
        ownerTeamId: true,
        supportTeamId: true
    });
    const supportTeamWebsite = await getWebsiteByOwnerTeamId_Service(store?.supportTeamId ?? '');
    const team = await getTeam_Service(store?.ownerTeamId ?? '', {
        ownerUserId: true
    });
    const teamMembers = (await getTeamMembers_Service(store?.ownerTeamId ?? '', team?.ownerUserId ?? ''))
        .map(member => ({
            ...member,
            email: redactEmail(member.email)
        }));
    return c.json({
        data: {
            teamMembers,
            supportTeamWebsite
        },
        error: null as ErrorType
    }, 200);
}; 