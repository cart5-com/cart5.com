import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { type Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import { KNOWN_ERROR, type ErrorType } from "@lib/types/errors";
import { validateCrossDomainTurnstile_WithUserCheck } from "@api-hono/utils/validateTurnstile";
import { getEnvVariable } from "@lib/utils/getEnvVariable";
import { decryptAndVerifyJwt } from "@api-hono/utils/jwt";
import type { InvitationLinkPayload } from "../website/team_invite.controller";
import {
    getTeamInvitation_Service,
    getExistingTeamMembership,
    addMemberToTeam
} from "@db/services/team.service";

export const teamInviteAccept_Schema = z.object({
    token: z.string().min(1, { message: 'Token is required' }),
    turnstile: z.string().min(1, { message: 'Turnstile token is required' }),
});
export const teamInviteAccept_SchemaValidator = zValidator('json', teamInviteAccept_Schema);


export const teamInviteAccept_Handler = async (c: Context<
    HonoVariables,
    "/team_invite_accept",
    ValidatorContext<typeof teamInviteAccept_SchemaValidator>
>) => {
    const turnstile = c.req.valid('json').turnstile;
    await validateCrossDomainTurnstile_WithUserCheck(turnstile, c);

    // c.req.valid('json').token,
    // c.get('USER')?.email!,
    // c.get('USER')?.id!

    const payload = await decryptAndVerifyJwt<InvitationLinkPayload>(
        getEnvVariable('JWT_PRIVATE_KEY'),
        getEnvVariable('ENCRYPTION_KEY'),
        c.req.valid('json').token
    );

    const invitationId = payload.invitationId;
    const invitation = await getTeamInvitation_Service(invitationId);
    if (!invitation) {
        throw new KNOWN_ERROR("Invitation not found", "INVITATION_NOT_FOUND");
    }

    if (invitation.status !== "PENDING") {
        throw new KNOWN_ERROR("Invitation is no longer valid", "INVITATION_ALREADY_PROCESSED");
    }

    if (invitation.email !== c.get('USER')?.email!) {
        throw new KNOWN_ERROR("Invitation is for a different email", "INVITATION_FOR_DIFFERENT_EMAIL");
    }

    const existingMembership = await getExistingTeamMembership(invitation.teamId, c.get('USER')?.id!);
    if (existingMembership) {
        throw new KNOWN_ERROR("User is already a member of the team", "USER_ALREADY_A_MEMBER_OF_TEAM");
    }

    await addMemberToTeam(
        invitation.teamId,
        c.get('USER')?.id!,
        invitation.permissions ?? [],
        invitationId
    );

    return c.json({
        // data: {
        //     status: "SUCCESS",
        //     teamId: invitation.teamId
        // },
        data: "SUCCESS",
        error: null as ErrorType
    }, 200);
}; 