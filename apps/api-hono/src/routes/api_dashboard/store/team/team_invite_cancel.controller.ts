import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";
import { KNOWN_ERROR } from "@lib/types/errors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getStore_Service } from "@db/services/store.service";
import { cancelTeamInvitation_Service } from "@db/services/team.service";

export const cancelStoreTeamInvitation_SchemaValidator = zValidator(
    'json',
    z.object({
        invitationId: z.string().min(1, { message: 'Invitation ID is required' })
    })
);

export const cancelStoreTeamInvitation_Handler = async (c: Context<
    HonoVariables,
    "/:storeId/team_invite_cancel",
    ValidatorContext<typeof cancelStoreTeamInvitation_SchemaValidator>
>) => {
    const store = await getStore_Service(c.req.param('storeId'), {
        ownerTeamId: true
    });

    const invitationId = c.req.valid('json').invitationId;

    const result = await cancelTeamInvitation_Service(
        invitationId,
        store?.ownerTeamId ?? ''
    );

    if (!result) {
        throw new KNOWN_ERROR(
            'The invitation was not found or has already been processed',
            'INVITATION_NOT_FOUND_OR_ALREADY_PROCESSED'
        );
    }

    return c.json({
        data: "SUCCESS",
        error: null as ErrorType
    }, 200);
}; 