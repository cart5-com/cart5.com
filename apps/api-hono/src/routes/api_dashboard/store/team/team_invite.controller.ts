import { TEAM_PERMISSIONS } from "@lib/consts";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import { KNOWN_ERROR, type ErrorType } from "@lib/types/errors";
import { getStore_Service } from "@db/services/store.service";
import { isInvitedBefore, insertInvitation } from "@db/services/team.service";
import { signJwtAndEncrypt } from "@api-hono/utils/jwt";
import { getEnvVariable } from "@lib/utils/getEnvVariable";
import { ENFORCE_HOSTNAME_CHECKS } from "@lib/utils/enforceHostnameChecks";
import { sendInvitationEmail } from "@api-hono/utils/email";

export const inviteStoreTeamMember_SchemaValidator = zValidator(
    'json',
    z.object({
        email: z.string().email({ message: 'Invalid email format' }),
        permissions: z.array(
            z.enum(Object.values(TEAM_PERMISSIONS) as [string, ...string[]])
        ).min(1, { message: 'At least one permission is required' })
    })
);

export const inviteStoreTeamMember_Handler = async (c: Context<
    HonoVariables,
    "/:storeId/team_invite",
    ValidatorContext<typeof inviteStoreTeamMember_SchemaValidator>
>) => {
    const store = await getStore_Service(c.req.param('storeId'), {
        name: true,
        ownerTeamId: true
    });

    const isInvited = await isInvitedBefore(
        c.req.valid('json').email,
        store?.ownerTeamId ?? ''
    );
    if (isInvited) {
        throw new KNOWN_ERROR(
            'The email has already been invited to the team',
            'EMAIL_ALREADY_INVITED'
        );
    }
    const invitation = await insertInvitation(
        c.req.valid('json').email,
        store?.ownerTeamId ?? '',
        c.req.valid('json').permissions,
        c.get('USER')?.id ?? '',
        store?.name ?? ''
    );
    const invitationLink = await generateInvitationLink(invitation.id, c.req.header()['host']);
    sendInvitationEmail(c.req.valid('json').email, invitationLink, store?.name ?? '');
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
    const protocol = ENFORCE_HOSTNAME_CHECKS ? 'https' : 'http';
    return `${protocol}://${host}/dashboard/team_invite_handler?token=${token}`;
};

export type InvitationLinkPayload = {
    nonce: string;
    invitationId: string;
} 