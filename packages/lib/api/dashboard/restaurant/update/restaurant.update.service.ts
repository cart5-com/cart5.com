import { eq, type InferInsertModel } from "drizzle-orm";
import { restaurantTable } from '../../../../db/schema/restaurant.schema';
import db from '../../../../db/drizzle';

export const updateRestaurant_Service = async (
    restaurantId: string,
    restaurantData: Partial<InferInsertModel<typeof restaurantTable>>
) => {
    const {
        // unallowed fields for admins
        id, created_at_ts, updated_at_ts, ownerTeamId, supportTeamId,
        // other fields
        ...data
    } = restaurantData;

    return await db.update(restaurantTable)
        .set(data)
        .where(eq(restaurantTable.id, restaurantId));
}