import { eq, and, gte, lte, asc, desc, count, sql } from 'drizzle-orm';
import db from '@db/drizzle';
import { storeTable, storeAddressTable, storeDeliveryZoneMapTable } from '@db/schema/store.schema';
import { websiteStoreMapTable } from '@db/schema/website.schema';
import type { OrderType } from '@lib/types/orderType';

export const getNearbyStores_Service = async (
    lat: number,
    lng: number,
    websiteId: string | null = null,
    measure: "km" | "mi" = "km",
    limit: number = 36,
    page: number = 1,
    searchRange: number = 20, // 1=1 km
    type: OrderType = 'delivery',
    sort: "distance_asc" | "distance_desc" = 'distance_asc',
) => {
    const radius = measure === 'km' ? 6371 : 3959;

    // Calculate the bounding box for initial filtering
    const latDelta = searchRange / 111; // Approximately 111 km or 69 miles
    const lngDelta = searchRange / (111 * Math.cos(lat * Math.PI / 180));

    const minLat = lat - latDelta;
    const maxLat = lat + latDelta;
    const minLng = lng - lngDelta;
    const maxLng = lng + lngDelta;

    // Build base conditions depending on whether we have a specific website or not
    let baseConditions = [];

    if (websiteId) {
        baseConditions.push(eq(websiteStoreMapTable.websiteId, websiteId));
    }

    // Add offers delivery/pickup filter based on listType
    if (type === 'delivery') {
        baseConditions.push(eq(storeTable.offersDelivery, true));
    } else if (type === 'pickup') {
        baseConditions.push(eq(storeTable.offersPickup, true));
    }

    // Using storeAddressTable for lat/lng filtering since storeDeliveryZoneMapTable doesn't have direct lat/lng fields
    baseConditions = [
        ...baseConditions,
        gte(storeAddressTable.lat, minLat),
        lte(storeAddressTable.lat, maxLat),
        gte(storeAddressTable.lng, minLng),
        lte(storeAddressTable.lng, maxLng),
    ];

    // Special conditions for delivery mode
    const deliveryConditions = [
        // We use min/max lat/lng from the delivery zone table
        gte(storeDeliveryZoneMapTable.maxLat, lat),
        lte(storeDeliveryZoneMapTable.minLat, lat),
        gte(storeDeliveryZoneMapTable.maxLng, lng),
        lte(storeDeliveryZoneMapTable.minLng, lng),
    ];

    let whereConditions = baseConditions;
    if (type === 'delivery') {
        whereConditions = [...whereConditions, ...deliveryConditions];
    } else if (type === 'pickup') {
        // do nothing
    }

    // Set order by based on sort parameter
    let orderBy;
    if (sort === 'distance_asc') {
        orderBy = asc(sql`distance`);
    } else {
        orderBy = desc(sql`distance`);
    }

    // Create the base query for both count and store selection
    const baseQueryFrom = (query: any) => {
        let q = query.from(storeTable);

        // If we have a specific website, join with the website store map
        if (websiteId) {
            q = q.innerJoin(
                websiteStoreMapTable,
                eq(storeTable.id, websiteStoreMapTable.storeId)
            );
        }

        // Join with address table for coordinates
        q = q.innerJoin(
            storeAddressTable,
            eq(storeTable.id, storeAddressTable.storeId)
        );

        // Join with delivery zone table if in delivery mode
        if (type === 'delivery') {
            q = q.innerJoin(
                storeDeliveryZoneMapTable,
                eq(storeTable.id, storeDeliveryZoneMapTable.storeId)
            );
        }

        return q;
    };

    // Run the count and stores queries in parallel for efficiency
    const [countResult, nearbyStores] = await Promise.all([
        baseQueryFrom(db.select({
            count: count()
        })).where(and(...whereConditions)),

        baseQueryFrom(db.select({
            id: storeTable.id,
            name: storeTable.name,
            // Using the address table for lat/lng
            lat: storeAddressTable.lat,
            lng: storeAddressTable.lng,
            address1: storeAddressTable.address1,

            /////////////////////////
            // v1 - Haversine formula for great-circle distance
            // distance: sql<number>`${radius} * 2 * ASIN(
            //     SQRT(
            //         (
            //             SIN((${storeAddressTable.lat} - ${lat}) * PI() / 180 / 2) *
            //             SIN((${storeAddressTable.lat} - ${lat}) * PI() / 180 / 2)
            //         ) +
            //         COS(${lat} * PI() / 180) *
            //         COS(${storeAddressTable.lat} * PI() / 180) *
            //         (
            //             SIN((${storeAddressTable.lng} - ${lng}) * PI() / 180 / 2) *
            //             SIN((${storeAddressTable.lng} - ${lng}) * PI() / 180 / 2)
            //         )
            //     )
            // )`.mapWith(Number).as('distance'),
            /////////////////////////


            /////////////////////////
            // v2 - simplified distance calculation
            // distance: sql<number>`${radius} * 2 * ASIN(
            //     SQRT(
            //         0.5 - COS((${storeAddressTable.lat} - ${lat}) * PI() / 180) / 2 +
            //         COS(${lat} * PI() / 180) * COS(${storeAddressTable.lat} * PI() / 180) *
            //         (1 - COS((${storeAddressTable.lng} - ${lng}) * PI() / 180)) / 2
            //     )
            // )`.mapWith(Number).as('distance'),
            /////////////////////////


            /////////////////////////
            // v3 - simplified distance with 0.017453292519943295 as PI/180
            distance: sql<number>`${radius} * 2 * ASIN(
                SQRT(
                    0.5 - COS((${storeAddressTable.lat} - ${lat}) * 0.017453292519943295) / 2 + 
                    COS(${lat} * 0.017453292519943295) * COS(${storeAddressTable.lat} * 0.017453292519943295) * 
                    (1 - COS((${storeAddressTable.lng} - ${lng}) * 0.017453292519943295)) / 2
                )
            )`.mapWith(Number).as('distance'),
            /////////////////////////
        }))
            .where(and(...whereConditions))
            .orderBy(orderBy)
            .limit(limit)
            .offset((page - 1) * limit)
    ]);

    return {
        stores: nearbyStores as {
            id: string;
            name: string;
            lat: number;
            lng: number;
            distance: number;
            address1: string | null;
        }[],
        pagination: {
            total: countResult[0]?.count || 0,
            page,
            limit,
            totalPages: Math.ceil((countResult[0]?.count || 0) / limit)
        }
    };
};