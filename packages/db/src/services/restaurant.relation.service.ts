import { restaurantAddressTable, restaurantOpenHoursTable, restaurantMenuTable, restaurantPaymentMethodsTable, restaurantTableReservationSettingsTable, restaurantTaxSettingsTable, restaurantScheduledOrdersSettingsTable, restaurantDeliveryZoneMapTable } from "@db/schema/restaurant.schema";
import db from "@db/drizzle";
import { eq } from "drizzle-orm";
// Define a map of all restaurant relation tables
const relationTables = {
    address: restaurantAddressTable,
    openHours: restaurantOpenHoursTable,
    menu: restaurantMenuTable,
    paymentMethods: restaurantPaymentMethodsTable,
    tableReservationSettings: restaurantTableReservationSettingsTable,
    taxSettings: restaurantTaxSettingsTable,
    scheduledOrders: restaurantScheduledOrdersSettingsTable,
    deliveryZones: restaurantDeliveryZoneMapTable
} as const;

// Type for relation names
type RelationName = keyof typeof relationTables;

/**
 * Generic function to get a restaurant relation entity
 */
export const getRestaurantRelation = async <T extends Record<string, any>, K extends keyof T>(
    table: any,
    restaurantId: string,
    columns?: Partial<Record<K, boolean>>
): Promise<Pick<T, K> | undefined> => {
    return await db.select(columns ? columns : table)
        .from(table)
        .where(eq(table.restaurantId, restaurantId))
        .then(rows => rows[0] as Pick<T, K> | undefined);
};

/**
 * Generic function to update a restaurant relation entity
 */
export const updateRestaurantRelation = async (
    table: any,
    restaurantId: string,
    data: any
) => {
    return await db.insert(table)
        .values({ ...data, restaurantId })
        .onConflictDoUpdate({
            target: table.restaurantId,
            set: data
        });
};

/**
 * Factory that creates get and update services for all restaurant relations
 */
const createRestaurantRelationServices = () => {
    const services = {} as {
        [K in RelationName]: {
            get: <T extends Record<string, any>, K extends keyof T>(
                restaurantId: string,
                columns?: Partial<Record<K, boolean>>
            ) => Promise<Pick<T, K> | undefined>;
            update: (restaurantId: string, data: any) => Promise<any>;
        }
    };

    // Create get and update services for each relation
    for (const [name, table] of Object.entries(relationTables)) {
        services[name as RelationName] = {
            get: async <T extends Record<string, any>, K extends keyof T>(
                restaurantId: string,
                columns?: Partial<Record<K, boolean>>
            ) => {
                return getRestaurantRelation<T, K>(table, restaurantId, columns);
            },
            update: async (restaurantId: string, data: any) => {
                return updateRestaurantRelation(table, restaurantId, data);
            }
        };
    }

    return services;
};

// Create all services at once
export const restaurantRelationService = createRestaurantRelationServices();

// // Example usage with proper type checking
// type AddressType = typeof restaurantAddressTable.$inferSelect;
// const example = await restaurantRelationService.address.get<AddressType, 'address1' | 'country'>(
//     '123',
//     {
//         address1: true,
//         country: true,
//         // sample: true, // gives error because sample is not in the columns object
//     }
// );
// console.log(example?.address1); // TypeScript knows this is a string | null | undefined
// console.log(example?.country);
// // console.log(example?.sample); // gives error 
// // console.log(example?.postalCode); // gives error because postalCode is not in the columns object