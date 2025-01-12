import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { and, count, eq } from "drizzle-orm";
import { type Context, type Next } from 'hono';
import { Hono } from "hono";
import { KNOWN_ERROR, type ErrorType } from "lib/errors";
import { validateTurnstile } from 'lib/utils/validateTurnstile';
import { env } from 'hono/adapter';
import { insertRestaurantSchema, restaurantTable, restaurantUserAdminsMapTable, selectRestaurantSchema, updateRestaurantSchema } from '../db/schema/restaurantSchema';
import db from '../db/drizzle';


export const restaurantRoute = new Hono<EcomApiHonoEnv>()
    .get('/my-restaurants', async (c) => {
        return c.json({
            data: await db
                .select({
                    id: restaurantTable.id,
                    name: restaurantTable.name,
                })
                .from(restaurantTable)
                .innerJoin(restaurantUserAdminsMapTable, eq(restaurantTable.id, restaurantUserAdminsMapTable.restaurantId))
                .where(eq(restaurantUserAdminsMapTable.userId, c.get('USER')?.id!)),
            error: null as ErrorType
        }, 200);
    })
    .post(
        '/create-restaurant',
        zValidator('form', z.object({
            name: insertRestaurantSchema.shape.name,
            turnstile: z.string().min(1, { message: "Verification required" })
        })),
        async (c) => {
            const { name, turnstile } = c.req.valid('form');
            await validateTurnstile(env(c).TURNSTILE_SECRET, turnstile, c.req.header()['x-forwarded-for']);
            const userId = c.get('USER')?.id!;
            return c.json({
                data: await db.transaction(async (tx) => {
                    const restaurant = await tx.insert(restaurantTable).values({
                        name: name,
                        ownerUserId: userId,
                    }).returning({ id: restaurantTable.id });

                    await tx.insert(restaurantUserAdminsMapTable).values({
                        restaurantId: restaurant[0].id,
                        userId: userId,
                    });

                    return restaurant[0].id;
                }),
                error: null as ErrorType
            }, 200);
        }
    )
    .post(
        '/update/:restaurantId',
        restaurantRouteAdminCheck,
        // Partial<typeof restaurantTable.$inferInsert>,
        zValidator('json', updateRestaurantSchema.omit({
            // unallowed fields for admins
            id: true,
            ownerUserId: true,
            created_at_ts: true,
            updated_at_ts: true
        })),
        async (c) => {
            return c.json({
                data: (await db
                    .update(restaurantTable)
                    .set(c.req.valid('json'))
                    .where(eq(restaurantTable.id, c.req.param('restaurantId')))).rowsAffected === 1 ? 'success' : 'nochange',
                error: null as ErrorType
            }, 200);
        }
    )
    .post(
        '/:restaurantId',
        restaurantRouteAdminCheck,
        zValidator('json', z.object({
            // columns?: Partial<Record<keyof typeof restaurantTable.$inferSelect, boolean>>,
            columns: z.record(z.enum(selectRestaurantSchema.keyof().options), z.boolean())
        })),
        async (c) => {
            // restaurantTable._.columns
            // columns ?: Partial<Record<keyof typeof restaurantTable.$inferSelect, boolean>>
            return c.json({
                data: await db.query.restaurantTable.findFirst({
                    where: eq(restaurantTable.id, c.req.param('restaurantId')),
                    columns: c.req.valid('json').columns
                }),
                error: null as ErrorType
            }, 200);
        }
    )


async function restaurantRouteAdminCheck(c: Context, next: Next) {
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

async function checkUserIsRestaurantAdmin(
    c: Context<EcomApiHonoEnv>,
    options: { userId: string, restaurantId: string }
) {
    return await db.select({
        count: count()
    }).from(restaurantUserAdminsMapTable).where(
        and(
            eq(restaurantUserAdminsMapTable.userId, options.userId),
            eq(restaurantUserAdminsMapTable.restaurantId, options.restaurantId)
        )
    ).then(result => result[0].count === 1);
}

