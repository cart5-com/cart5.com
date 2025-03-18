import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ErrorType } from "@lib/types/errors";
import { getWebsite_Service } from "@db/services/website.service";
import { getTeamInvitations_Service } from "@db/services/team.service";
import { redactEmail } from "@lib/utils/redactEmail";

export const getTeamInvitations_Handler = async (c: Context<
    HonoVariables,
    "/:websiteId/team_invitations"
>) => {
    const website = await getWebsite_Service(c.req.param('websiteId'), {
        ownerTeamId: true
    });

    const invitations = (await getTeamInvitations_Service(website?.ownerTeamId ?? ''))
        .map(invitation => ({
            ...invitation,
            email: redactEmail(invitation.email)
        }))
        .map(invitation => ({
            ...invitation,
            status: invitation.status === 'PENDING' && invitation.createdAt < Date.now() - 1000 * 60 * 60 * 24 * 7 ? 'EXPIRED' : invitation.status
        }));

    return c.json({
        data: invitations,
        error: null as ErrorType
    }, 200);
}; 