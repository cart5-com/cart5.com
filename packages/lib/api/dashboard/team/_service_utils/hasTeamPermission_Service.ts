import db from "../../../../db/drizzle";
import { teamTable, teamUserMapTable } from "../../../../db/schema/team.schema";
import { eq, and } from "drizzle-orm";

export const hasTeamPermission_Service = async (
    userId: string,
    teamId: string,
    permissions: string[]
) => {
    const team = await db.select({
        ownerUserId: teamTable.ownerUserId
    })
        .from(teamTable)
        .where(eq(teamTable.id, teamId))
        .then(results => results[0]);

    if (!team) {
        return false;
    }

    if (team.ownerUserId === userId) {
        return true;
    }

    const member = await db.select({
        permissions: teamUserMapTable.permissions
    })
        .from(teamUserMapTable)
        .where(
            and(
                eq(teamUserMapTable.teamId, teamId),
                eq(teamUserMapTable.userId, userId)
            )
        )
        .then(results => results[0]);

    if (member && Array.isArray(member.permissions)) {
        if (member.permissions.some(permission => permissions.includes(permission))) {
            return true;
        }
    }

    return false;
}
