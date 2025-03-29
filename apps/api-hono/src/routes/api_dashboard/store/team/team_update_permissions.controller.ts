import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";
import { KNOWN_ERROR } from "@lib/types/errors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getStore_Service } from "@db/services/store.service";
import { getTeam_Service, updateTeamMemberPermissions_Service } from "@db/services/team.service";
import { TEAM_PERMISSIONS } from "@lib/consts";

export const updateStoreTeamMemberPermissions_SchemaValidator = zValidator(
    'json',
    z.object({
        memberId: z.string().min(1, { message: 'Member ID is required' }),
        permissions: z.array(
            z.enum(Object.values(TEAM_PERMISSIONS) as [string, ...string[]])
        ).min(1, { message: 'At least one permission is required' })
    })
);

export const updateStoreTeamMemberPermissions_Handler = async (c: Context<
    HonoVariables,
    "/:storeId/team_update_permissions",
    ValidatorContext<typeof updateStoreTeamMemberPermissions_SchemaValidator>
>) => {
    const store = await getStore_Service(c.req.param('storeId'), {
        ownerTeamId: true
    });

    if (!store) {
        throw new KNOWN_ERROR(
            'Store not found',
            'STORE_NOT_FOUND'
        );
    }

    const team = await getTeam_Service(store.ownerTeamId, {
        ownerUserId: true
    });

    if (!team) {
        throw new KNOWN_ERROR(
            'Team not found',
            'TEAM_NOT_FOUND'
        );
    }

    const currentUserId = c.get('USER')?.id ?? '';
    const { memberId, permissions } = c.req.valid('json');

    // Cannot update your own permissions
    if (memberId === currentUserId) {
        throw new KNOWN_ERROR(
            'You cannot update your own permissions',
            'CANNOT_UPDATE_SELF_PERMISSIONS'
        );
    }

    // Cannot update the owner's permissions
    if (memberId === team.ownerUserId) {
        throw new KNOWN_ERROR(
            'Cannot update the team owner\'s permissions',
            'CANNOT_UPDATE_OWNER_PERMISSIONS'
        );
    }

    const result = await updateTeamMemberPermissions_Service(
        store.ownerTeamId,
        memberId,
        team.ownerUserId,
        permissions
    );

    if (!result) {
        throw new KNOWN_ERROR(
            'Failed to update team member permissions',
            'FAILED_TO_UPDATE_PERMISSIONS'
        );
    }

    return c.json({
        data: result,
        error: null as ErrorType
    }, 200);
}; 