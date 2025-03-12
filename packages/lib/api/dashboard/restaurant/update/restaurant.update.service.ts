import { eq } from "drizzle-orm";
import {
    restaurantTable,
} from '../../../../db/schema/restaurant.schema';
import db from '../../../../db/drizzle';


export const updateRestaurant_Service = async (
    restaurantId: string,
    data: Partial<typeof restaurantTable.$inferInsert>
) => {
    const {
        // unallowed fields for admins
        id, ownerUserId, created_at_ts, updated_at_ts,
        // other fields
        ...restaurantData
    } = data;

    return await db.update(restaurantTable)
        .set(restaurantData)
        .where(eq(restaurantTable.id, restaurantId));
}