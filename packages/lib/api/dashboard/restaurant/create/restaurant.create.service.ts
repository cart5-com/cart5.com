import db from '../../../../db/drizzle';
import { restaurantTable } from '../../../../db/schema/restaurant.schema';
import { createTeamTransactional_Service } from '../../team/service_utils/createTeamTransactional_Service';
export const createRestaurant_Service = async (userId: string, name: string) => {
    return await db.transaction(async (tx) => {
        const teamId = await createTeamTransactional_Service(userId, `${name} Team`, tx);

        const restaurant = await tx.insert(restaurantTable).values({
            name: name,
            ownerTeamId: teamId,
        }).returning({ id: restaurantTable.id });

        return restaurant[0].id;
    })
} 