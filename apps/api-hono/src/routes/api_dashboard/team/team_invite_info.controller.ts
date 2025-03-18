import { zValidator } from "@hono/zod-validator";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import { type ErrorType } from "@lib/types/errors";
import { z } from "zod";
import { getTeamInvitation_Service } from "@db/services/team.service";
import { KNOWN_ERROR } from "@lib/types/errors";
import { redactEmail } from "@lib/utils/redactEmail";
import { getEnvVariable } from "@lib/utils/getEnvVariable";
import { decryptAndVerifyJwt } from "@api-hono/utils/jwt";
import type { InvitationLinkPayload } from "../website/team/team_invite.controller";

export const teamInviteToken_Schema = z.object({
    token: z.string().min(1, { message: 'Token is required' }),
});

export const teamInviteToken_SchemaValidator = zValidator('json', teamInviteToken_Schema);

export const teamInviteInfo_Handler = async (c: Context<
    HonoVariables,
    "/team_invite_info",
    ValidatorContext<typeof teamInviteToken_SchemaValidator>
>) => {
    const token = c.req.valid('json').token;
    const currentUserEmail = c.get('USER')?.email!;

    const payload = await decryptAndVerifyJwt<InvitationLinkPayload>(
        getEnvVariable('JWT_PRIVATE_KEY'),
        getEnvVariable('ENCRYPTION_KEY'),
        token
    );

    const invitationId = payload.invitationId;

    const invitation = await getTeamInvitation_Service(invitationId);
    if (!invitation) {
        throw new KNOWN_ERROR("Invitation not found", "INVITATION_NOT_FOUND");
    }

    if (invitation.status !== "PENDING") {
        throw new KNOWN_ERROR("Invitation is no longer valid", "INVITATION_ALREADY_PROCESSED");
    }

    if (invitation.email !== currentUserEmail) {
        throw new KNOWN_ERROR("Invitation is for a different email", "INVITATION_FOR_DIFFERENT_EMAIL");
    }

    return c.json({
        data: {
            teamName: invitation.teamName,
            email: redactEmail(invitation.email)
        },
        error: null as ErrorType
    }, 200);
};
