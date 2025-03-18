import { TEAM_PERMISSIONS } from "@lib/consts";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import { KNOWN_ERROR, type ErrorType } from "@lib/types/errors";
import { getWebsite_Service } from "@db/services/website.service";
import { isInvitedBefore, insertInvitation } from "@db/services/team.service";
import { signJwtAndEncrypt } from "@api-hono/utils/jwt";
import { getEnvVariable } from "@lib/utils/getEnvVariable";
import { ENFORCE_HOSTNAME_CHECKS } from "@lib/utils/enforceHostnameChecks";
import { sendInvitationEmail } from "@api-hono/utils/email";

export const inviteTeamMember_SchemaValidator = zValidator(
    'json',
    z.object({
        email: z.string().email({ message: 'Invalid email format' }),
        permissions: z.array(
            z.enum(Object.values(TEAM_PERMISSIONS) as [string, ...string[]])
        ).min(1, { message: 'At least one permission is required' })
    })
);

export const inviteTeamMember_Handler = async (c: Context<
    HonoVariables,
    "/:websiteId/team_invite",
    ValidatorContext<typeof inviteTeamMember_SchemaValidator>
>) => {
    const website = await getWebsite_Service(c.req.param('websiteId'), {
        name: true,
        ownerTeamId: true
    });

    const isInvited = await isInvitedBefore(
        c.req.valid('json').email,
        website?.ownerTeamId ?? ''
    );
    if (isInvited) {
        throw new KNOWN_ERROR(
            'The email has already been invited to the team',
            'EMAIL_ALREADY_INVITED'
        );
    }
    const invitation = await insertInvitation(
        c.req.valid('json').email,
        website?.ownerTeamId ?? '',
        c.req.valid('json').permissions,
        c.get('USER')?.id ?? '',
        website?.name ?? ''
    );
    const invitationLink = await generateInvitationLink(invitation.id, c.req.header()['host']);
    await sendInvitationEmail(c.req.valid('json').email, invitationLink, website?.name ?? '');
    return c.json({
        data: "SUCCESS",
        error: null as ErrorType
    }, 201);
};


export const generateInvitationLink = async (invitationId: string, host: string) => {
    const token = await signJwtAndEncrypt<InvitationLinkPayload>(
        getEnvVariable('JWT_PRIVATE_KEY'),
        getEnvVariable('ENCRYPTION_KEY'),
        {
            nonce: crypto.randomUUID(),
            invitationId,
        },
        100800 // 1 week in minutes
    );
    // TODO: convert all /dash/... to /dashboard/
    const protocol = ENFORCE_HOSTNAME_CHECKS ? 'https' : 'http';
    return `${protocol}://${host}/dash/team_invite_handler?token=${token}`;
};

export type InvitationLinkPayload = {
    nonce: string;
    invitationId: string;
}