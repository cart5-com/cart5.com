import { eq } from 'drizzle-orm';
import db from '../../../../db/drizzle';
import { restaurantAddressTable } from '../../../../db/schema/restaurant.schema';

export const getAddress_Service = async (
    restaurantId: string,
    columns?: Partial<Record<keyof typeof restaurantAddressTable.$inferSelect, boolean>>
) => {
    // https://orm.drizzle.team/docs/rqb
    return await db.query.restaurantAddressTable.findFirst({
        where: eq(restaurantAddressTable.restaurantId, restaurantId),
        columns: columns,
        // Partial fields select
        // extras: {
        //     loweredName: sql`lower(${restaurantAddressTable.name})`.as('lowered_name'),
        //     contentLength: (sql<number>`length(${restaurantAddressTable.name})`).as('content_length'),
        // },
        // orderBy: [asc(restaurantAddressTable.id)],
        // offset is only available for top level query.
        // offset: 2, // correct ✅
        // limit: 1,
        // orderBy: [desc(restaurantAddressTable.created_at_ts)],
        // with: {
        //     address: {
        //         orderBy: (address, { desc }) => [desc(address.id)],
        //         offset: 2,
        //         limit: 1,
        //         columns: {
        //             address1: true,
        //         }
        //     }
        // }
    });
} 