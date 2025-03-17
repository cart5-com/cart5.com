import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ErrorType } from "@lib/types/errors";
import { getTeam_Service, getTeamMembers_Service } from "@db/services/team.service";
import { getWebsite_Service } from "@db/services/website.service";
import { redactEmail } from "@lib/utils/redactEmail";
export const getWebsiteTeamMembers_Handler = async (c: Context<
    HonoVariables,
    "/:websiteId/team"
>) => {
    // const websiteId = c.req.param('websiteId');
    // const userId = c.get('USER')?.id!;
    const website = await getWebsite_Service(c.req.param('websiteId'), {
        ownerTeamId: true
    });
    const team = await getTeam_Service(website?.ownerTeamId ?? '', {
        ownerUserId: true
    });
    const teamMembers = (await getTeamMembers_Service(team?.id ?? '', team?.ownerUserId ?? ''))
        .map(member => ({
            ...member,
            email: redactEmail(member.email)
        }));
    return c.json({
        data: teamMembers,
        error: null as ErrorType
    }, 200);
}; 