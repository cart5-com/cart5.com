import { eq, inArray, or } from 'drizzle-orm';
import db from '../../../../db/drizzle';
import { restaurantAddressTable, restaurantTable } from '../../../../db/schema/restaurant.schema';
import { teamUserMapTable } from '../../../../db/schema/team.schema';

export const getMyRestaurants_Service = async (userId: string) => {
    const myTeams = await db.select()
        .from(teamUserMapTable)
        .where(eq(teamUserMapTable.userId, userId));

    const restaurants = await db.select({
        id: restaurantTable.id,
        name: restaurantTable.name,
        address1: restaurantAddressTable.address1
    })
        .from(restaurantTable)
        .leftJoin(
            restaurantAddressTable,
            eq(restaurantTable.id, restaurantAddressTable.restaurantId)
        )
        .where(
            or(
                inArray(restaurantTable.supportTeamId, myTeams.map(team => team.teamId)),
                inArray(restaurantTable.ownerTeamId, myTeams.map(team => team.teamId))
            )
        );

    return restaurants;
}