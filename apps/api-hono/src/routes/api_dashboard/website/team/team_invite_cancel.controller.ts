import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";
import { KNOWN_ERROR } from "@lib/types/errors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getWebsite_Service } from "@db/services/website.service";
import { cancelTeamInvitation_Service } from "@db/services/team.service";

export const cancelTeamInvitation_SchemaValidator = zValidator(
    'json',
    z.object({
        invitationId: z.string().min(1, { message: 'Invitation ID is required' })
    })
);

export const cancelTeamInvitation_Handler = async (c: Context<
    HonoVariables,
    "/:websiteId/team_invite_cancel",
    ValidatorContext<typeof cancelTeamInvitation_SchemaValidator>
>) => {
    const website = await getWebsite_Service(c.req.param('websiteId'), {
        ownerTeamId: true
    });

    const invitationId = c.req.valid('json').invitationId;

    const result = await cancelTeamInvitation_Service(
        invitationId,
        website?.ownerTeamId ?? ''
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