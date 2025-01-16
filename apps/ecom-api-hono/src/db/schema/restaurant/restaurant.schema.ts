import { integer, primaryKey, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { generateKey } from "lib/utils/generateKey";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

/// RESTAURANT TABLE START
export const restaurantTable = sqliteTable("restaurant", {
	id: text("id").notNull().primaryKey().unique().$defaultFn(() => generateKey('rest')),

	name: text("name", { mode: 'text', length: 510 }).notNull(),

	defaultPhoneNumber: text("default_phone_number"),
	extraPhoneNumbers: text("extra_phone_numbers", { mode: 'json' }).$type<string[]>().$defaultFn(() => []),

	addressFull: text("address_full"),
	addressCountry: text("address_country"),
	addressDetails: text("address_details"),
	addressLat: real('address_lat'), //.notNull().default(90), // North Pole latitude
	addressLng: real('address_lng'), //.notNull().default(-180), // North Pole longitude
	addressMetadata: text('address_metadata', { mode: 'json' }).$type<any>(),

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
export const insertRestaurantSchema = createInsertSchema(restaurantTable, {
	name: (schema) => schema.min(3, { message: "min 3" }).max(510, { message: "max 510" }),
	extraPhoneNumbers: z.array(z.string()).default([]),
});
export const updateRestaurantSchema = createUpdateSchema(restaurantTable, {
	name: (schema) => schema.min(3, { message: "min 3" }).max(510, { message: "max 510" }),
	extraPhoneNumbers: z.array(z.string()).default([]),
});
/// RESTAURANT TABLE END






/// RESTAURANT USER ADMINS MAP START
export const restaurantUserAdminsMapTable = sqliteTable("restaurant_user_admins_map", {
	restaurantId: text("restaurant_id").notNull(),
	userId: text("user_id").notNull(),
}, (table) => ({
	pk: primaryKey({ columns: [table.restaurantId, table.userId] }),
}));
/// RESTAURANT USER ADMINS MAP END
