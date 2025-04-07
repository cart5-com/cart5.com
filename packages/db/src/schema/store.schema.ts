import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from 'drizzle-orm';
import { z } from 'zod';
import { generateKey } from "@lib/utils/generateKey";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import {
	type DeliveryZone,
	DeliveryZoneSchema
} from "@lib/zod/deliverySchema";
import {
	type PhysicalPaymentMethods,
	PhysicalPaymentMethodsSchema
} from "@lib/zod/paymentMethodsSchema";
import { TaxCategorySchema, type TaxCategory } from "@lib/zod/taxSchema";
import { WeeklyHoursSchema, type WeeklyHours } from "@lib/zod/weeklyScheduleSchema";
import { MenuRootSchema, type MenuRoot } from "@lib/zod/menuRootSchema";
import { autoCreated, autoCreatedUpdated } from "./helpers/auto-created-updated";

/// STORE TABLE START
export const storeTable = sqliteTable("store", {
	...autoCreatedUpdated,
	id: text("id").notNull().primaryKey().unique().$defaultFn(() => generateKey('str')),

	name: text("name", { mode: 'text', length: 510 }).notNull(),

	defaultPhoneNumber: text("default_phone_number"),
	extraPhoneNumbers: text("extra_phone_numbers", { mode: 'json' }).$type<string[]>().$defaultFn(() => []),

	cuisines: text("cuisines", { mode: 'json' }).$type<string[]>().$defaultFn(() => []),

	offersPickup: integer("offers_pickup", { mode: "boolean" }).notNull().default(false),
	offersDelivery: integer("offers_delivery", { mode: "boolean" }).notNull().default(false),

	ownerTeamId: text("owner_team_id").notNull(),
	supportTeamId: text("support_team_id"),

});

export const selectStoreSchema = createSelectSchema(storeTable);
export const insertStoreSchema = createInsertSchema(storeTable, {
	name: (schema) => schema.min(3, { message: "min 3" }).max(510, { message: "max 510" }),
	extraPhoneNumbers: z.array(z.string()).default([]),
	cuisines: z.array(z.string()).default([]),
});
export const updateStoreSchema = createUpdateSchema(storeTable, {
	name: (schema) => schema.min(3, { message: "min 3" }).max(510, { message: "max 510" }),
	extraPhoneNumbers: z.array(z.string()).default([]),
	cuisines: z.array(z.string()).default([]),
});

/// STORE TABLE END





export const storeRecentlyUpdatedTable = sqliteTable("store_recently_updated", {
	storeId: text("store_id").notNull().unique(),
	...autoCreated,
});







/// STORE ADDRESS TABLE START
export const storeAddressTable = sqliteTable("store_address", {
	storeId: text("store_id").notNull().unique(),
	address1: text("address_1"),
	address2: text("address_2"),
	city: text("city"),
	state: text("state"), // State/Province/Territory
	postalCode: text("postal_code"),
	country: text("country"),
	lat: real('lat'), //.notNull().default(90), // North Pole latitude
	lng: real('lng'), //.notNull().default(-180), // North Pole longitude
});
export const selectStoreAddressSchema = createSelectSchema(storeAddressTable);
export const insertStoreAddressSchema = createInsertSchema(storeAddressTable, {
});
export const updateStoreAddressSchema = createUpdateSchema(storeAddressTable, {
});
/// STORE ADDRESS TABLE END





/// STORE HOURS TABLE START
export const storeOpenHoursTable = sqliteTable('store_open_hours', {
	storeId: text("store_id").notNull().unique(),
	timezone: text('timezone'),
	defaultOpenHours: text('open_hours', { mode: 'json' }).$type<WeeklyHours>(),
	deliveryHours: text('delivery_hours', { mode: 'json' }).$type<WeeklyHours>(),
	pickupHours: text('pickup_hours', { mode: 'json' }).$type<WeeklyHours>(),
});
export const selectStoreOpenHoursSchema = createSelectSchema(storeOpenHoursTable);
export const insertStoreOpenHoursSchema = createInsertSchema(storeOpenHoursTable, {
	defaultOpenHours: WeeklyHoursSchema.nullable(),
	deliveryHours: WeeklyHoursSchema.nullable(),
	pickupHours: WeeklyHoursSchema.nullable(),
});
export const updateStoreOpenHoursSchema = createUpdateSchema(storeOpenHoursTable, {
	defaultOpenHours: WeeklyHoursSchema.nullable(),
	deliveryHours: WeeklyHoursSchema.nullable(),
	pickupHours: WeeklyHoursSchema.nullable(),
});
/// STORE HOURS TABLE END








/// STORE MENU TABLE START
export const storeMenuTable = sqliteTable('store_menu', {
	storeId: text("store_id").notNull().unique(),
	menuRoot: text('menu_root', { mode: 'json' }).$type<MenuRoot>(),
});
export const selectStoreMenuSchema = createSelectSchema(storeMenuTable);
export const insertStoreMenuSchema = createInsertSchema(storeMenuTable, {
	menuRoot: MenuRootSchema.nullable(),
});
export const updateStoreMenuSchema = createUpdateSchema(storeMenuTable, {
	menuRoot: MenuRootSchema.nullable(),
});
/// STORE MENU TABLE END










/// STORE PAYMENT METHODS TABLE START
export const storePaymentMethodsTable = sqliteTable('store_payment_methods', {
	storeId: text("store_id").notNull().unique(),
	defaultPaymentMethods: text('default_payment_methods', { mode: 'json' }).$type<PhysicalPaymentMethods>(),
	deliveryPaymentMethods: text('delivery_payment_methods', { mode: 'json' }).$type<PhysicalPaymentMethods>(),
	pickupPaymentMethods: text('pickup_payment_methods', { mode: 'json' }).$type<PhysicalPaymentMethods>(),
});
export const selectStorePaymentMethodsSchema = createSelectSchema(storePaymentMethodsTable);
export const insertStorePaymentMethodsSchema = createInsertSchema(storePaymentMethodsTable, {
	defaultPaymentMethods: PhysicalPaymentMethodsSchema.nullable(),
	deliveryPaymentMethods: PhysicalPaymentMethodsSchema.nullable(),
	pickupPaymentMethods: PhysicalPaymentMethodsSchema.nullable(),
});
export const updateStorePaymentMethodsSchema = createUpdateSchema(storePaymentMethodsTable, {
	defaultPaymentMethods: PhysicalPaymentMethodsSchema.nullable(),
	deliveryPaymentMethods: PhysicalPaymentMethodsSchema.nullable(),
	pickupPaymentMethods: PhysicalPaymentMethodsSchema.nullable(),
});
/// STORE PAYMENT METHODS TABLE END







/// TAX SETTINGS TABLE START
export const storeTaxSettingsTable = sqliteTable('store_tax_settings', {
	storeId: text("store_id").notNull().unique(),
	currency: text('currency'),
	currencySymbol: text('currency_symbol'),
	salesTaxType: text('sales_tax_type', { enum: ['ITEMS_PRICES_ALREADY_INCLUDE_TAXES', 'APPLY_TAX_ON_TOP_OF_PRICES'] }),
	taxName: text('tax_name'),
	taxRateForDelivery: real('tax_rate_for_delivery'),
	taxCategories: text('tax_categories', { mode: 'json' }).$type<TaxCategory[]>().$defaultFn(() => []),
});
export const selectStoreTaxSettingsSchema = createSelectSchema(storeTaxSettingsTable);
export const insertStoreTaxSettingsSchema = createInsertSchema(storeTaxSettingsTable, {
	taxCategories: z.array(TaxCategorySchema).default([]),
});
export const updateStoreTaxSettingsSchema = createUpdateSchema(storeTaxSettingsTable, {
	taxCategories: z.array(TaxCategorySchema).default([]),
});
/// TAX SETTINGS TABLE END






/// DELIVERY ZONES START
export const storeDeliveryZoneMapTable = sqliteTable("store_delivery_zone_map", {
	storeId: text("store_id").notNull().unique(),
	zones: text('zones', { mode: 'json' }).$type<DeliveryZone[]>().$defaultFn(() => []),
	minLat: real('min_lat'), // .notNull().default(90),
	maxLat: real('max_lat'), // .notNull().default(90),
	minLng: real('min_lng'), // .notNull().default(-180),
	maxLng: real('max_lng'), // .notNull().default(-180),
});
export const selectStoreDeliveryZoneMapSchema = createSelectSchema(storeDeliveryZoneMapTable);
export const insertStoreDeliveryZoneMapSchema = createInsertSchema(storeDeliveryZoneMapTable, {
	zones: z.array(DeliveryZoneSchema).default([]),
});
export const updateStoreDeliveryZoneMapSchema = createUpdateSchema(storeDeliveryZoneMapTable, {
	zones: z.array(DeliveryZoneSchema).default([]),
});
/// DELIVERY ZONES END




export const storeRelations = relations(storeTable, ({
	one,
	// many
}) => ({
	address:
		one(
			storeAddressTable, {
			fields: [storeTable.id],
			references: [storeAddressTable.storeId]
		}),
	openHours:
		one(
			storeOpenHoursTable, {
			fields: [storeTable.id],
			references: [storeOpenHoursTable.storeId]
		}),
	menu:
		one(
			storeMenuTable, {
			fields: [storeTable.id],
			references: [storeMenuTable.storeId]
		}),
	paymentMethods:
		one(
			storePaymentMethodsTable, {
			fields: [storeTable.id],
			references: [storePaymentMethodsTable.storeId]
		}),
	taxSettings:
		one(
			storeTaxSettingsTable, {
			fields: [storeTable.id],
			references: [storeTaxSettingsTable.storeId]
		}),
	deliveryZones:
		one(
			storeDeliveryZoneMapTable, {
			fields: [storeTable.id],
			references: [storeDeliveryZoneMapTable.storeId]
		}),
}));