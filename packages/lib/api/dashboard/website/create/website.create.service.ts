import { websitesTable } from '../../../../db/schema/website.schema';
import db from '../../../../db/drizzle';
import {
    TEAM_PERMISSIONS,
    teamTable,
    teamUserMapTable
} from '../../../../db/schema/team.schema';

export const createWebsite_Service = async (userId: string, name: string) => {
    return await db.transaction(async (tx) => {
        const teamId = await createTeamTransactional_Service(userId, `${name} Team`, tx);
        // TODO: add support team
        const website = await tx.insert(websitesTable).values({
            name: name,
            ownerTeamId: teamId,
        }).returning({ id: websitesTable.id });

        return website[0].id;
    })
}


export const createTeamTransactional_Service = async (
    userId: string,
    name: string,
    tx: Parameters<Parameters<typeof db.transaction>[0]>[0]
) => {
    const team = await tx.insert(teamTable).values({
        name: name,
        ownerUserId: userId
    }).returning();

    await tx.insert(teamUserMapTable).values({
        teamId: team[0].id,
        userId: userId,
        permissions: [TEAM_PERMISSIONS.FULL_ACCESS]
    });

    return team[0].id;
}