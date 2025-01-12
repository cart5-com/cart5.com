import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { generateKey } from "lib/utils/generateKey";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";

/// RESTAURANT TABLE START
export const restaurantTable = sqliteTable("restaurant", {
	id: text("id").notNull().primaryKey().unique().$defaultFn(() => generateKey('rest')),

	name: text("name", { length: 550 }).notNull(),

	ownerUserId: text("owner_user_id").notNull(),

	created_at_ts: integer("created_at_ts")
		.notNull()
		.$defaultFn(() => Date.now()),
	updated_at_ts: integer("updated_at_ts")
		.notNull()
		.$defaultFn(() => Date.now())
		.$onUpdate(() => Date.now()),
});

export const selectRestaurantSchema = createSelectSchema(restaurantTable);
export const insertRestaurantSchema = createInsertSchema(restaurantTable);
export const updateRestaurantSchema = createUpdateSchema(restaurantTable);
/// RESTAURANT TABLE END






/// RESTAURANT USER ADMINS MAP START
export const restaurantUserAdminsMapTable = sqliteTable("restaurant_user_admins_map", {
	restaurantId: text("restaurant_id").notNull(),
	userId: text("user_id").notNull(),
}, (table) => ({
	pk: primaryKey({ columns: [table.restaurantId, table.userId] }),
}));
/// RESTAURANT USER ADMINS MAP END
