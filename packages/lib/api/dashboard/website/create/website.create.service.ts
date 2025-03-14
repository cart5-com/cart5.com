import { websitesTable } from '../../../../db/schema/website.schema';
import db from '../../../../db/drizzle';
import { createTeamTransactional_Service } from '../../team/_service_utils/createTeamTransactional_Service';

export const createWebsite_Service = async (userId: string, name: string, supportTeamId: string | null) => {
    return await db.transaction(async (tx) => {
        const teamId = await createTeamTransactional_Service(userId, 'WEBSITE', tx);
        // TODO: add support team
        const website = await tx.insert(websitesTable).values({
            name: name,
            ownerTeamId: teamId,
            supportTeamId: supportTeamId,
        }).returning({ id: websitesTable.id });

        return website[0].id;
    })
}