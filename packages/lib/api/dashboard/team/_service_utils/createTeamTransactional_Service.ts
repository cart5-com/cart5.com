import db from "../../../../db/drizzle";
import {
    teamTable,
    teamUserMapTable,
    TEAM_PERMISSIONS
} from "../../../../db/schema/team.schema";

export const createTeamTransactional_Service = async (
    userId: string,
    name: string,
    tx: Parameters<Parameters<typeof db.transaction>[0]>[0]
) => {
    // add team to db
    const team = await tx.insert(teamTable).values({
        name: name,
        ownerUserId: userId
    }).returning();

    // make user a member of the new team
    await tx.insert(teamUserMapTable).values({
        teamId: team[0].id,
        userId: userId,
        permissions: [TEAM_PERMISSIONS.FULL_ACCESS]
    });

    return team[0].id;
}