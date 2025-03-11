import { eq } from 'drizzle-orm';
import db from '../../../../db/drizzle';
import { restaurantTable, restaurantAddressTable, restaurantOpenHoursTable, restaurantMenuTable, restaurantPaymentMethodsTable, restaurantTableReservationSettingsTable, restaurantTaxSettingsTable, restaurantScheduledOrdersSettingsTable, restaurantDeliveryZoneMapTable } from '../../../../db/schema/restaurant.schema';
import type { NonEmpty } from "../../../../types/typeUtils";

export const getRestaurant_Service = async (
    restaurantId: string,
    columns?: Partial<Record<keyof typeof restaurantTable.$inferSelect, boolean>> & {
        address?: Partial<Record<keyof typeof restaurantAddressTable.$inferSelect, boolean>>
        openHours?: Partial<Record<keyof typeof restaurantOpenHoursTable.$inferSelect, boolean>>
        menu?: Partial<Record<keyof typeof restaurantMenuTable.$inferSelect, boolean>>
        paymentMethods?: Partial<Record<keyof typeof restaurantPaymentMethodsTable.$inferSelect, boolean>>
        tableReservationSettings?: Partial<Record<keyof typeof restaurantTableReservationSettingsTable.$inferSelect, boolean>>
        taxSettings?: Partial<Record<keyof typeof restaurantTaxSettingsTable.$inferSelect, boolean>>
        scheduledOrdersSettings?: Partial<Record<keyof typeof restaurantScheduledOrdersSettingsTable.$inferSelect, boolean>>
        deliveryZones?: Partial<Record<keyof typeof restaurantDeliveryZoneMapTable.$inferSelect, boolean>>
    }
) => {
    const restaurant = await db.query.restaurantTable.findFirst({
        where: eq(restaurantTable.id, restaurantId),
        columns: columns,
        with: {
            ...(columns?.address && {
                address: {
                    columns: columns.address
                }
            }),
            ...(columns?.openHours && {
                openHours: {
                    columns: columns.openHours
                }
            }),
            ...(columns?.menu && {
                menu: {
                    columns: columns.menu
                }
            }),
            ...(columns?.paymentMethods && {
                paymentMethods: {
                    columns: columns.paymentMethods
                }
            }),
            ...(columns?.tableReservationSettings && {
                tableReservationSettings: {
                    columns: columns.tableReservationSettings
                }
            }),
            ...(columns?.taxSettings && {
                taxSettings: {
                    columns: columns.taxSettings
                }
            }),
            ...(columns?.scheduledOrdersSettings && {
                scheduledOrdersSettings: {
                    columns: columns.scheduledOrdersSettings
                }
            }),
            ...(columns?.deliveryZones && {
                deliveryZones: {
                    columns: columns.deliveryZones
                }
            })
        }
    })

    // this typing is to make sure typing work with hono rpc.
    // https://hono.dev/docs/guides/rpc
    // api never returns {} but drizzle adds a {} when there is no "with" query ...
    type restaurantType = NonNullable<typeof restaurant>;

    type address = restaurantType['address'] // this has | {}
    type nonEmptyAddress = NonEmpty<address> // this has not 

    type openHours = restaurantType['openHours']
    type nonEmptyOpenHours = NonEmpty<openHours>

    type menu = restaurantType['menu']
    type nonEmptyMenu = NonEmpty<menu>

    type paymentMethods = restaurantType['paymentMethods']
    type nonEmptyPaymentMethods = NonEmpty<paymentMethods>

    type tableReservationSettings = restaurantType['tableReservationSettings']
    type nonEmptyTableReservationSettings = NonEmpty<tableReservationSettings>

    type taxSettings = restaurantType['taxSettings']
    type nonEmptyTaxSettings = NonEmpty<taxSettings>

    type scheduledOrdersSettings = restaurantType['scheduledOrdersSettings']
    type nonEmptyScheduledOrdersSettings = NonEmpty<scheduledOrdersSettings>

    type deliveryZones = restaurantType['deliveryZones']
    type nonEmptyDeliveryZones = NonEmpty<deliveryZones>

    type newRestaurantType = (
        Omit<
            restaurantType,
            'address' | 'openHours' | 'deliveryZones' |
            'scheduledOrdersSettings' | 'taxSettings'
        > & {
            address?: nonEmptyAddress
            openHours?: nonEmptyOpenHours
            menu?: nonEmptyMenu
            paymentMethods?: nonEmptyPaymentMethods
            tableReservationSettings?: nonEmptyTableReservationSettings
            scheduledOrdersSettings?: nonEmptyScheduledOrdersSettings
            deliveryZones?: nonEmptyDeliveryZones
            taxSettings?: nonEmptyTaxSettings
        }
    ) | undefined

    return restaurant as newRestaurantType;
}