import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from 'drizzle-orm';
import { z } from 'zod';
import { generateKey } from "@lib/utils/generateKey";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import type {
	DeliveryZone,
	PhysicalPaymentMethods,
	TaxCategory
} from "@lib/types/restaurantTypes";
import type { WeeklyHours } from "@lib/types/dateTimeType";
import type { MenuRoot } from "@lib/types/menuType";
import { autoCreatedUpdated } from "./helpers/auto-created-updated";

/// RESTAURANT TABLE START
export const restaurantTable = sqliteTable("restaurant", {
	...autoCreatedUpdated,
	id: text("id").notNull().primaryKey().unique().$defaultFn(() => generateKey('rest')),

	name: text("name", { mode: 'text', length: 510 }).notNull(),

	defaultPhoneNumber: text("default_phone_number"),
	extraPhoneNumbers: text("extra_phone_numbers", { mode: 'json' }).$type<string[]>().$defaultFn(() => []),

	cuisines: text("cuisines", { mode: 'json' }).$type<string[]>().$defaultFn(() => []),

	offersPickup: integer("offers_pickup", { mode: "boolean" }).notNull().default(false),
	offersDelivery: integer("offers_delivery", { mode: "boolean" }).notNull().default(false),

	ownerTeamId: text("owner_team_id").notNull(),
	supportTeamId: text("support_team_id"),

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
	restaurantId: text("restaurant_id").notNull().unique(),
	address1: text("address_1"),
	address2: text("address_2"),
	city: text("city"),
	state: text("state"), // State/Province/Territory
	postalCode: text("postal_code"),
	country: text("country"),
	lat: real('lat'), //.notNull().default(90), // North Pole latitude
	lng: real('lng'), //.notNull().default(-180), // North Pole longitude
});
export const selectRestaurantAddressSchema = createSelectSchema(restaurantAddressTable);
export const insertRestaurantAddressSchema = createInsertSchema(restaurantAddressTable, {
});
export const updateRestaurantAddressSchema = createUpdateSchema(restaurantAddressTable, {
});
/// RESTAURANT ADDRESS TABLE END





/// RESTAURANT HOURS TABLE START
export const restaurantOpenHoursTable = sqliteTable('restaurant_open_hours', {
	restaurantId: text("restaurant_id").notNull().unique(),
	timezone: text('timezone'),
	defaultOpenHours: text('open_hours', { mode: 'json' }).$type<WeeklyHours>(),
	deliveryHours: text('delivery_hours', { mode: 'json' }).$type<WeeklyHours>(),
	pickupHours: text('pickup_hours', { mode: 'json' }).$type<WeeklyHours>(),
});
export const selectRestaurantOpenHoursSchema = createSelectSchema(restaurantOpenHoursTable);
export const insertRestaurantOpenHoursSchema = createInsertSchema(restaurantOpenHoursTable, {
	defaultOpenHours: z.custom<WeeklyHours>((_val) => true),
	deliveryHours: z.custom<WeeklyHours>((_val) => true),
	pickupHours: z.custom<WeeklyHours>((_val) => true),
});
export const updateRestaurantOpenHoursSchema = createUpdateSchema(restaurantOpenHoursTable, {
	defaultOpenHours: z.custom<WeeklyHours>((_val) => true),
	deliveryHours: z.custom<WeeklyHours>((_val) => true),
	pickupHours: z.custom<WeeklyHours>((_val) => true),
});
/// RESTAURANT HOURS TABLE END








/// RESTAURANT MENU TABLE START
export const restaurantMenuTable = sqliteTable('restaurant_menu', {
	restaurantId: text("restaurant_id").notNull().unique(),
	menuRoot: text('menu_root', { mode: 'json' }).$type<MenuRoot>(),
});
export const selectRestaurantMenuSchema = createSelectSchema(restaurantMenuTable);
export const insertRestaurantMenuSchema = createInsertSchema(restaurantMenuTable, {
	menuRoot: z.custom<MenuRoot>((_val) => true),
});
export const updateRestaurantMenuSchema = createUpdateSchema(restaurantMenuTable, {
	menuRoot: z.custom<MenuRoot>((_val) => true),
});
/// RESTAURANT MENU TABLE END










/// RESTAURANT PAYMENT METHODS TABLE START
export const restaurantPaymentMethodsTable = sqliteTable('restaurant_payment_methods', {
	restaurantId: text("restaurant_id").notNull().unique(),
	defaultPaymentMethods: text('default_payment_methods', { mode: 'json' }).$type<PhysicalPaymentMethods>(),
	deliveryPaymentMethods: text('delivery_payment_methods', { mode: 'json' }).$type<PhysicalPaymentMethods>(),
	pickupPaymentMethods: text('pickup_payment_methods', { mode: 'json' }).$type<PhysicalPaymentMethods>(),
});

export const selectRestaurantPaymentMethodsSchema = createSelectSchema(restaurantPaymentMethodsTable);
export const insertRestaurantPaymentMethodsSchema = createInsertSchema(restaurantPaymentMethodsTable, {
	defaultPaymentMethods: z.custom<PhysicalPaymentMethods>((_val) => true),
	deliveryPaymentMethods: z.custom<PhysicalPaymentMethods>((_val) => true),
	pickupPaymentMethods: z.custom<PhysicalPaymentMethods>((_val) => true),
});
export const updateRestaurantPaymentMethodsSchema = createUpdateSchema(restaurantPaymentMethodsTable, {
	defaultPaymentMethods: z.custom<PhysicalPaymentMethods>((_val) => true),
	deliveryPaymentMethods: z.custom<PhysicalPaymentMethods>((_val) => true),
	pickupPaymentMethods: z.custom<PhysicalPaymentMethods>((_val) => true),
});
/// RESTAURANT PAYMENT METHODS TABLE END







/// TAX SETTINGS TABLE START
export const restaurantTaxSettingsTable = sqliteTable('restaurant_tax_settings', {
	restaurantId: text("restaurant_id").notNull().unique(),
	currency: text('currency'),
	currencySymbol: text('currency_symbol'),
	salesTaxType: text('sales_tax_type', { enum: ['ITEMS_PRICES_ALREADY_INCLUDE_TAXES', 'APPLY_TAX_ON_TOP_OF_PRICES'] }),
	taxName: text('tax_name'),
	taxRateForDelivery: real('tax_rate_for_delivery'),
	taxCategories: text('tax_categories', { mode: 'json' }).$type<TaxCategory[]>().$defaultFn(() => []),
});
export const selectRestaurantTaxSettingsSchema = createSelectSchema(restaurantTaxSettingsTable);
export const insertRestaurantTaxSettingsSchema = createInsertSchema(restaurantTaxSettingsTable, {
	taxCategories: z.array(z.custom<TaxCategory>((_val) => true)).default([]),
});
export const updateRestaurantTaxSettingsSchema = createUpdateSchema(restaurantTaxSettingsTable, {
	taxCategories: z.array(z.custom<TaxCategory>((_val) => true)).default([]),
});
/// TAX SETTINGS TABLE END






/// DELIVERY ZONES START
export const restaurantDeliveryZoneMapTable = sqliteTable("restaurant_delivery_zone_map", {
	restaurantId: text("restaurant_id").notNull().unique(),
	zones: text('zones', { mode: 'json' }).$type<DeliveryZone[]>().$defaultFn(() => []),
	minLat: real('min_lat'), // .notNull().default(90),
	maxLat: real('max_lat'), // .notNull().default(90),
	minLng: real('min_lng'), // .notNull().default(-180),
	maxLng: real('max_lng'), // .notNull().default(-180),
});
export const selectRestaurantDeliveryZoneMapSchema = createSelectSchema(restaurantDeliveryZoneMapTable);
export const insertRestaurantDeliveryZoneMapSchema = createInsertSchema(restaurantDeliveryZoneMapTable, {
	zones: z.array(z.custom<DeliveryZone>((_val) => true)).default([]),
});
export const updateRestaurantDeliveryZoneMapSchema = createUpdateSchema(restaurantDeliveryZoneMapTable, {
	zones: z.array(z.custom<DeliveryZone>((_val) => true)).default([]),
});
/// DELIVERY ZONES END




export const restaurantRelations = relations(restaurantTable, ({
	one,
	// many
}) => ({
	address:
		one(
			restaurantAddressTable, {
			fields: [restaurantTable.id],
			references: [restaurantAddressTable.restaurantId]
		}),
	openHours:
		one(
			restaurantOpenHoursTable, {
			fields: [restaurantTable.id],
			references: [restaurantOpenHoursTable.restaurantId]
		}),
	menu:
		one(
			restaurantMenuTable, {
			fields: [restaurantTable.id],
			references: [restaurantMenuTable.restaurantId]
		}),
	paymentMethods:
		one(
			restaurantPaymentMethodsTable, {
			fields: [restaurantTable.id],
			references: [restaurantPaymentMethodsTable.restaurantId]
		}),
	taxSettings:
		one(
			restaurantTaxSettingsTable, {
			fields: [restaurantTable.id],
			references: [restaurantTaxSettingsTable.restaurantId]
		}),
	deliveryZones:
		one(
			restaurantDeliveryZoneMapTable, {
			fields: [restaurantTable.id],
			references: [restaurantDeliveryZoneMapTable.restaurantId]
		}),
}));