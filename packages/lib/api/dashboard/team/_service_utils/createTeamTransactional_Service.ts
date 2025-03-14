import db from "../../../../db/drizzle";
import {
    teamTable,
    teamUserMapTable,
    TEAM_PERMISSIONS
} from "../../../../db/schema/team.schema";

export const createTeamTransactional_Service = async (
    userId: string,
    type: 'RESTAURANT' | 'WEBSITE',
    tx: Parameters<Parameters<typeof db.transaction>[0]>[0]
) => {
    // add team to db
    const team = await tx.insert(teamTable).values({
        ownerUserId: userId,
        type: type
    }).returning();

    // make user a member of the new team
    await tx.insert(teamUserMapTable).values({
        teamId: team[0].id,
        userId: userId,
        permissions: [TEAM_PERMISSIONS.FULL_ACCESS]
    });

    return team[0].id;
}