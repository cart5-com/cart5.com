import db from "../../../../db/drizzle";
import { eq } from "drizzle-orm";
import { restaurantUserAdminsMapTable } from "../../../../db/schema/restaurant.schema";

export const getMyRestaurants_Service = async (userId: string) => {
    return (await db.query.restaurantUserAdminsMapTable.findMany({
        where: eq(restaurantUserAdminsMapTable.userId, userId),
        columns: {},
        // offset is only available for top level query.
        // offset: 2, // correct ✅
        with: {
            restaurant: {
                // offset: 3, // incorrect ❌
                columns: {
                    id: true,
                    name: true,
                },
                with: {
                    address: {
                        columns: {
                            address1: true,
                        }
                    }
                },
                // extras: {
                //     loweredName: sql`lower(${restaurantTable.name})`.as('lowered_name'),
                // },
            }
        },
        // extras: {
        //     loweredName: sql`lower(${restaurantTable.name})`.as('lowered_name'),
        // },
    })).map(item => item.restaurant);
} 