import { and, count, eq } from "drizzle-orm";
import { type Context, type Next } from 'hono';
import { restaurantTable, restaurantUserAdminsMapTable } from "../schema/restaurantSchema";
import { KNOWN_ERROR } from "lib/errors";

export const getUserRestaurants = async (
    c: Context<EcomApiHonoEnv>,
    options: { userId: string }
) => {
    return await c.get('DRIZZLE_DB')
        .select({
            id: restaurantTable.id,
            name: restaurantTable.name,
        })
        .from(restaurantTable)
        .innerJoin(restaurantUserAdminsMapTable, eq(restaurantTable.id, restaurantUserAdminsMapTable.restaurantId))
        .where(eq(restaurantUserAdminsMapTable.userId, options.userId));
}

export const createRestaurant = async (
    c: Context<EcomApiHonoEnv>,
    options: { name: string, userId: string }
) => {
    return await c.get('DRIZZLE_DB').transaction(async (tx) => {
        const restaurant = await tx.insert(restaurantTable).values({
            name: options.name,
            ownerUserId: options.userId,
        }).returning({ id: restaurantTable.id });

        await tx.insert(restaurantUserAdminsMapTable).values({
            restaurantId: restaurant[0].id,
            userId: options.userId,
        });

        return restaurant[0].id;
    });
}

export const restaurantRouteAdminCheck = async (c: Context, next: Next) => {
    const userId = c.get('USER')?.id;
    const restaurantId = c.req.param('restaurantId');
    if (!userId || !restaurantId) {
        throw new KNOWN_ERROR("Unauthorized", "UNAUTHORIZED");
    }
    const isAdmin = await checkUserIsRestaurantAdmin(c, {
        userId,
        restaurantId
    });
    if (!isAdmin) {
        throw new KNOWN_ERROR("Not admin", "UNAUTHORIZED");
    }
    await next();
}

export const checkUserIsRestaurantAdmin = async (
    c: Context<EcomApiHonoEnv>,
    options: { userId: string, restaurantId: string }
) => {
    return await c.get('DRIZZLE_DB').select({
        count: count()
    }).from(restaurantUserAdminsMapTable).where(
        and(
            eq(restaurantUserAdminsMapTable.userId, options.userId),
            eq(restaurantUserAdminsMapTable.restaurantId, options.restaurantId)
        )
    ).then(result => result[0].count === 1);
}

export const updateRestaurant = async (
    c: Context<EcomApiHonoEnv>,
    options: {
        restaurantId: string,
        dataToUpdate: Partial<typeof restaurantTable.$inferInsert>,
    }
) => {
    const { restaurantId, dataToUpdate } = options;

    // unallowed fields for admins
    const { id, ownerUserId, created_at_ts, updated_at_ts,
        ...updateData } = dataToUpdate;

    const result = await c.get('DRIZZLE_DB')
        .update(restaurantTable)
        .set(updateData) // Type assertion to bypass the type error
        .where(eq(restaurantTable.id, restaurantId))

    if (result.rowsAffected !== 1) {
        throw new KNOWN_ERROR('error', 'ERROR');
    }

    return true;
}

export const getRestaurant = async (
    c: Context<EcomApiHonoEnv>,
    options: {
        restaurantId: string,
    }
) => {
    const { restaurantId } = options;
    const results = await c.get('DRIZZLE_DB').select().from(restaurantTable).where(eq(restaurantTable.id, restaurantId));
    return results[0];
}