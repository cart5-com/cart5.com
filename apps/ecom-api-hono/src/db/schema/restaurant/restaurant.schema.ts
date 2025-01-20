import { integer, primaryKey, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from 'drizzle-orm';
import { generateKey } from "lib/utils/generateKey";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

/// RESTAURANT TABLE START
export const restaurantTable = sqliteTable("restaurant", {
	id: text("id").notNull().primaryKey().unique().$defaultFn(() => generateKey('rest')),

	name: text("name", { mode: 'text', length: 510 }).notNull(),

	defaultPhoneNumber: text("default_phone_number"),
	extraPhoneNumbers: text("extra_phone_numbers", { mode: 'json' }).$type<string[]>().$defaultFn(() => []),

	// links: text("links", { mode: 'json' }).$type<string[]>().$defaultFn(() => []),
	cuisines: text("cuisines", { mode: 'json' }).$type<string[]>().$defaultFn(() => []),
	ownerUserId: text("owner_user_id").notNull(),

	offersPickup: integer("offers_pickup", { mode: "boolean" }).notNull().default(false),
	offersDelivery: integer("offers_delivery", { mode: "boolean" }).notNull().default(false),

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
	// links: z.array(z.string()).default([]),
	cuisines: z.array(z.string()).default([]),
});
export const updateRestaurantSchema = createUpdateSchema(restaurantTable, {
	name: (schema) => schema.min(3, { message: "min 3" }).max(510, { message: "max 510" }),
	extraPhoneNumbers: z.array(z.string()).default([]),
	// links: z.array(z.string()).default([]),
	cuisines: z.array(z.string()).default([]),
});
/// RESTAURANT TABLE END


/// RESTAURANT ADDRESS TABLE START
export const restaurantAddressTable = sqliteTable("restaurant_address", {
	restaurantId: text("restaurant_id").notNull(),
	address1: text("address_1"),
	address2: text("address_2"),
	city: text("city"),
	state: text("state"), // State/Province/Territory
	postalCode: text("postal_code"),
	country: text("country"),
	lat: real('lat'), //.notNull().default(90), // North Pole latitude
	lng: real('lng'), //.notNull().default(-180), // North Pole longitude
	geocodeMetadata: text('geocode_metadata', { mode: 'json' }).$type<any>(),
	timezone: text('timezone'),
});
export const selectRestaurantAddressSchema = createSelectSchema(restaurantAddressTable);
export const insertRestaurantAddressSchema = createInsertSchema(restaurantAddressTable);
export const updateRestaurantAddressSchema = createUpdateSchema(restaurantAddressTable);
// geocodeMetadata: z.any().default({}),
/// RESTAURANT ADDRESS TABLE END



/// RESTAURANT USER ADMINS MAP START
export const restaurantUserAdminsMapTable = sqliteTable("restaurant_user_admins_map", {
	restaurantId: text("restaurant_id").notNull(),
	userId: text("user_id").notNull(),
}, (table) => [
	primaryKey({ columns: [table.restaurantId, table.userId] }),
]);
/// RESTAURANT USER ADMINS MAP END


export const restaurantRelations = relations(restaurantTable, ({ one }) => ({
	address:
		one(
			restaurantAddressTable, {
			fields: [restaurantTable.id],
			references: [restaurantAddressTable.restaurantId]
		}),
}));

export const restaurantUserAdminsMapRelations = relations(restaurantUserAdminsMapTable, ({ one }) => ({
	restaurant: one(restaurantTable, {
		fields: [restaurantUserAdminsMapTable.restaurantId],
		references: [restaurantTable.id]
	}),
}));