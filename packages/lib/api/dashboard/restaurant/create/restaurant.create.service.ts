import db from '../../../../db/drizzle';
import { restaurantTable } from '../../../../db/schema/restaurant.schema';
import { createTeamTransactional_Service } from '../../team/_service_utils/createTeamTransactional_Service';

export const createRestaurant_Service = async (userId: string, name: string, supportTeamId: string | null) => {
    return await db.transaction(async (tx) => {
        const teamId = await createTeamTransactional_Service(userId, tx);

        const restaurant = await tx.insert(restaurantTable).values({
            name: name,
            ownerTeamId: teamId,
            supportTeamId: supportTeamId
        }).returning({ id: restaurantTable.id });

        return restaurant[0].id;
    })
} 