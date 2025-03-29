import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ErrorType } from "@lib/types/errors";
import { getStore_Service } from "@db/services/store.service";
import { getTeamInvitations_Service } from "@db/services/team.service";
import { redactEmail } from "@lib/utils/redactEmail";

export const getStoreTeamInvitations_Handler = async (c: Context<
    HonoVariables,
    "/:storeId/team_invitations"
>) => {
    const store = await getStore_Service(c.req.param('storeId'), {
        ownerTeamId: true
    });

    const invitations = (await getTeamInvitations_Service(store?.ownerTeamId ?? ''))
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