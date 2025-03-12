import { eq } from 'drizzle-orm';
import db from '../../../../db/drizzle';
import { restaurantPaymentMethodsTable } from '../../../../db/schema/restaurant.schema';

export const getPaymentMethods_Service = async (
    restaurantId: string,
    columns?: Partial<Record<keyof typeof restaurantPaymentMethodsTable.$inferSelect, boolean>>
) => {
    return await db.query.restaurantPaymentMethodsTable.findFirst({
        where: eq(restaurantPaymentMethodsTable.restaurantId, restaurantId),
        columns: columns
    });
} 