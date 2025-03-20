import { eq, and, gte, lte, asc, desc, count, sql } from 'drizzle-orm';
import db from '@db/drizzle';
import { restaurantTable, restaurantAddressTable, restaurantDeliveryZoneMapTable } from '@db/schema/restaurant.schema';
import { websiteRestaurantMapTable } from '@db/schema/website.schema';

// TODO: add open hours filter for current week day and time
// it is not crucial because we are caching results, we will double check on the client side
// but it is good to have it
export const getNearbyRestaurants = async (
    lat: number,
    lng: number,
    websiteId: string | null = null,
    measure: "km" | "mi" = "km",
    limit: number = 10,
    page: number = 1,
    range: number = 1,
    listType: "pickup" | "delivery" = 'pickup',
    sort: "distance_asc" | "distance_desc" = 'distance_asc',
) => {
    const radius = measure === 'km' ? 6371 : 3959;

    // Calculate the bounding box for initial filtering
    const latDelta = range; // Approximately 111 km or 69 miles
    const lngDelta = range / Math.cos(lat * Math.PI / 180);

    const minLat = lat - latDelta;
    const maxLat = lat + latDelta;
    const minLng = lng - lngDelta;
    const maxLng = lng + lngDelta;

    // Build base conditions depending on whether we have a specific website or not
    let baseConditions = [];

    if (websiteId) {
        baseConditions.push(eq(websiteRestaurantMapTable.websiteId, websiteId));
    }

    // Using restaurantAddressTable for lat/lng filtering since restaurantDeliveryZoneMapTable doesn't have direct lat/lng fields
    baseConditions = [
        ...baseConditions,
        gte(restaurantAddressTable.lat, minLat),
        lte(restaurantAddressTable.lat, maxLat),
        gte(restaurantAddressTable.lng, minLng),
        lte(restaurantAddressTable.lng, maxLng),
    ];

    // Special conditions for delivery mode
    const deliveryConditions = [
        // We use min/max lat/lng from the delivery zone table
        gte(restaurantDeliveryZoneMapTable.maxLat, lat),
        lte(restaurantDeliveryZoneMapTable.minLat, lat),
        gte(restaurantDeliveryZoneMapTable.maxLng, lng),
        lte(restaurantDeliveryZoneMapTable.minLng, lng),
    ];

    const whereConditions = listType === 'delivery'
        ? [...baseConditions, ...deliveryConditions]
        : baseConditions;

    // Set order by based on sort parameter
    let orderBy;
    if (sort === 'distance_asc') {
        orderBy = asc(sql`distance`);
    } else {
        orderBy = desc(sql`distance`);
    }

    // Create the base query for both count and restaurant selection
    const baseQueryFrom = (query: any) => {
        let q = query.from(restaurantTable);

        // If we have a specific website, join with the website restaurant map
        if (websiteId) {
            q = q.innerJoin(
                websiteRestaurantMapTable,
                eq(restaurantTable.id, websiteRestaurantMapTable.restaurantId)
            );
        }

        // Join with address table for coordinates
        q = q.innerJoin(
            restaurantAddressTable,
            eq(restaurantTable.id, restaurantAddressTable.restaurantId)
        );

        // Join with delivery zone table if in delivery mode
        if (listType === 'delivery') {
            q = q.innerJoin(
                restaurantDeliveryZoneMapTable,
                eq(restaurantTable.id, restaurantDeliveryZoneMapTable.restaurantId)
            );
        }

        return q;
    };

    // Run the count and restaurants queries in parallel for efficiency
    const [countResult, nearbyRestaurants] = await Promise.all([
        baseQueryFrom(db.select({
            count: count()
        })).where(and(...whereConditions)),

        baseQueryFrom(db.select({
            id: restaurantTable.id,
            name: restaurantTable.name,
            // Using the address table for lat/lng
            lat: restaurantAddressTable.lat,
            lng: restaurantAddressTable.lng,

            /////////////////////////
            // v1 - Haversine formula for great-circle distance
            // distance: sql<number>`${radius} * 2 * ASIN(
            //     SQRT(
            //         (
            //             SIN((${restaurantAddressTable.lat} - ${lat}) * PI() / 180 / 2) *
            //             SIN((${restaurantAddressTable.lat} - ${lat}) * PI() / 180 / 2)
            //         ) +
            //         COS(${lat} * PI() / 180) *
            //         COS(${restaurantAddressTable.lat} * PI() / 180) *
            //         (
            //             SIN((${restaurantAddressTable.lng} - ${lng}) * PI() / 180 / 2) *
            //             SIN((${restaurantAddressTable.lng} - ${lng}) * PI() / 180 / 2)
            //         )
            //     )
            // )`.mapWith(Number).as('distance'),
            /////////////////////////


            /////////////////////////
            // v2 - simplified distance calculation
            // distance: sql<number>`${radius} * 2 * ASIN(
            //     SQRT(
            //         0.5 - COS((${restaurantAddressTable.lat} - ${lat}) * PI() / 180) / 2 +
            //         COS(${lat} * PI() / 180) * COS(${restaurantAddressTable.lat} * PI() / 180) *
            //         (1 - COS((${restaurantAddressTable.lng} - ${lng}) * PI() / 180)) / 2
            //     )
            // )`.mapWith(Number).as('distance'),
            /////////////////////////


            /////////////////////////
            // v3 - simplified distance with 0.017453292519943295 as PI/180
            distance: sql<number>`${radius} * 2 * ASIN(
                SQRT(
                    0.5 - COS((${restaurantAddressTable.lat} - ${lat}) * 0.017453292519943295) / 2 + 
                    COS(${lat} * 0.017453292519943295) * COS(${restaurantAddressTable.lat} * 0.017453292519943295) * 
                    (1 - COS((${restaurantAddressTable.lng} - ${lng}) * 0.017453292519943295)) / 2
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
        restaurants: nearbyRestaurants as {
            id: string;
            name: string;
            lat: number;
            lng: number;
            distance: number;
        }[],
        pagination: {
            total: countResult[0]?.count || 0,
            page,
            limit,
            totalPages: Math.ceil((countResult[0]?.count || 0) / limit)
        }
    };
};