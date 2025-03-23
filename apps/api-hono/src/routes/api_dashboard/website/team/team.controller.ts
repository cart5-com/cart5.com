import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ErrorType } from "@lib/types/errors";
import { getTeam_Service, getTeamMembers_Service } from "@db/services/team.service";
import { getWebsite_Service } from "@db/services/website.service";
import { redactEmail } from "@lib/utils/redactEmail";
import { getWebsiteByOwnerTeamId_Service } from "@db/services/website.service";
export const getWebsiteTeamMembers_Handler = async (c: Context<
    HonoVariables,
    "/:websiteId/team"
>) => {
    // const websiteId = c.req.param('websiteId');
    // const userId = c.get('USER')?.id!;
    const website = await getWebsite_Service(c.req.param('websiteId'), {
        ownerTeamId: true,
        supportTeamId: true
    });
    const supportTeamWebsite = await getWebsiteByOwnerTeamId_Service(website?.supportTeamId ?? '');
    const team = await getTeam_Service(website?.ownerTeamId ?? '', {
        ownerUserId: true
    });
    const teamMembers = (await getTeamMembers_Service(website?.ownerTeamId ?? '', team?.ownerUserId ?? ''))
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