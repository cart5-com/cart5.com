import db from '../../../../db/drizzle';
import { restaurantPaymentMethodsTable } from '../../../../db/schema/restaurant.schema';
import type { InferInsertModel } from 'drizzle-orm';

export const updatePaymentMethods_Service = async (
    id: string,
    paymentMethodsData: Partial<InferInsertModel<typeof restaurantPaymentMethodsTable>>
) => {
    const {
        // unallowed fields for admins
        restaurantId,
        // other fields
        ...data
    } = paymentMethodsData;
    return await db.insert(restaurantPaymentMethodsTable)
        .values({ ...data, restaurantId: id })
        .onConflictDoUpdate({
            target: restaurantPaymentMethodsTable.restaurantId,
            set: data
        });
} 