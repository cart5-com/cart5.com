import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from 'drizzle-orm';
import { z } from 'zod';
import { generateKey } from "@lib/utils/generateKey";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import type {
	DeliveryZone,
	PhysicalPaymentMethods,
	ScheduledOrdersSettings,
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
	offersOnPremise: integer("offers_on_premise", { mode: "boolean" }).notNull().default(false),
	offersTableReservation: integer("offers_table_reservation", { mode: "boolean" }).notNull().default(false),

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
	geocodeMetadata: text('geocode_metadata', { mode: 'json' }).$type<any>(),
});
export const selectRestaurantAddressSchema = createSelectSchema(restaurantAddressTable);
export const insertRestaurantAddressSchema = createInsertSchema(restaurantAddressTable, {
	geocodeMetadata: z.any(),
});
export const updateRestaurantAddressSchema = createUpdateSchema(restaurantAddressTable, {
	geocodeMetadata: z.any(),
});
/// RESTAURANT ADDRESS TABLE END





/// RESTAURANT HOURS TABLE START
export const restaurantOpenHoursTable = sqliteTable('restaurant_open_hours', {
	restaurantId: text("restaurant_id").notNull().unique(),
	timezone: text('timezone'),
	defaultOpenHours: text('open_hours', { mode: 'json' }).$type<WeeklyHours>(),
	deliveryHours: text('delivery_hours', { mode: 'json' }).$type<WeeklyHours>(),
	pickupHours: text('pickup_hours', { mode: 'json' }).$type<WeeklyHours>(),
	onPremiseHours: text('on_premise_hours', { mode: 'json' }).$type<WeeklyHours>(),
	tableReservationHours: text('table_reservation_hours', { mode: 'json' }).$type<WeeklyHours>(),
});
export const selectRestaurantOpenHoursSchema = createSelectSchema(restaurantOpenHoursTable);
export const insertRestaurantOpenHoursSchema = createInsertSchema(restaurantOpenHoursTable, {
	defaultOpenHours: z.custom<WeeklyHours>((_val) => true),
	deliveryHours: z.custom<WeeklyHours>((_val) => true),
	pickupHours: z.custom<WeeklyHours>((_val) => true),
	onPremiseHours: z.custom<WeeklyHours>((_val) => true),
	tableReservationHours: z.custom<WeeklyHours>((_val) => true),
});
export const updateRestaurantOpenHoursSchema = createUpdateSchema(restaurantOpenHoursTable, {
	defaultOpenHours: z.custom<WeeklyHours>((_val) => true),
	deliveryHours: z.custom<WeeklyHours>((_val) => true),
	pickupHours: z.custom<WeeklyHours>((_val) => true),
	onPremiseHours: z.custom<WeeklyHours>((_val) => true),
	tableReservationHours: z.custom<WeeklyHours>((_val) => true),
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
	onPremisePaymentMethods: text('on_premise_payment_methods', { mode: 'json' }).$type<PhysicalPaymentMethods>(),
	tableReservationPaymentMethods: text('table_reservation_payment_methods', { mode: 'json' }).$type<PhysicalPaymentMethods>(),
});

export const selectRestaurantPaymentMethodsSchema = createSelectSchema(restaurantPaymentMethodsTable);
export const insertRestaurantPaymentMethodsSchema = createInsertSchema(restaurantPaymentMethodsTable, {
	defaultPaymentMethods: z.custom<PhysicalPaymentMethods>((_val) => true),
	deliveryPaymentMethods: z.custom<PhysicalPaymentMethods>((_val) => true),
	pickupPaymentMethods: z.custom<PhysicalPaymentMethods>((_val) => true),
	onPremisePaymentMethods: z.custom<PhysicalPaymentMethods>((_val) => true),
	tableReservationPaymentMethods: z.custom<PhysicalPaymentMethods>((_val) => true),
});
export const updateRestaurantPaymentMethodsSchema = createUpdateSchema(restaurantPaymentMethodsTable, {
	defaultPaymentMethods: z.custom<PhysicalPaymentMethods>((_val) => true),
	deliveryPaymentMethods: z.custom<PhysicalPaymentMethods>((_val) => true),
	pickupPaymentMethods: z.custom<PhysicalPaymentMethods>((_val) => true),
	onPremisePaymentMethods: z.custom<PhysicalPaymentMethods>((_val) => true),
	tableReservationPaymentMethods: z.custom<PhysicalPaymentMethods>((_val) => true),
});
/// RESTAURANT PAYMENT METHODS TABLE END




/// RESTAURANT TABLE RESERVATION SETTINGS START
export const restaurantTableReservationSettingsTable = sqliteTable('restaurant_table_reservation_settings', {
	restaurantId: text("restaurant_id").notNull().unique(),
	minGuests: integer("min_guests"),
	maxGuests: integer("max_guests"),
	minTimeInAdvanceMinutes: integer("min_time_in_advance_minutes"),
	maxTimeInAdvanceDays: integer("max_time_in_advance_days"),
	lateHoldTimeMinutes: integer("late_hold_time_minutes"),
	allowPreOrder: integer("allow_pre_order", { mode: "boolean" }),
});
export const selectRestaurantTableReservationSettingsSchema = createSelectSchema(restaurantTableReservationSettingsTable);
export const insertRestaurantTableReservationSettingsSchema = createInsertSchema(restaurantTableReservationSettingsTable);
export const updateRestaurantTableReservationSettingsSchema = createUpdateSchema(restaurantTableReservationSettingsTable);
/// RESTAURANT TABLE RESERVATION SETTINGS END






/// TAX SETTINGS TABLE START
export const restaurantTaxSettingsTable = sqliteTable('restaurant_tax_settings', {
	restaurantId: text("restaurant_id").notNull().unique(),
	currency: text('currency'),
	// TODO: ADD currencySymbol: text('currency_symbol'),
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







/// RESTAURANT SCHEDULED ORDERS SETTINGS TABLE START
export const restaurantScheduledOrdersSettingsTable = sqliteTable('restaurant_scheduled_orders_settings', {
	restaurantId: text("restaurant_id").notNull().unique(),
	isScheduledOrdersEnabled: integer("is_scheduled_orders_enabled", { mode: "boolean" }).default(false),
	isOnlyScheduledOrdersAllowed: integer("is_only_scheduled_orders_allowed", { mode: "boolean" }).default(false), // if true, ASAP delivery&pickup are disabled

	// on update will be calculated from pickup_settings
	pickup_minTimeInAdvance_minutes: integer("pickup_min_time_in_advance_minutes", { mode: "number" }),
	pickup_maxTimeInAdvance_minutes: integer("pickup_max_time_in_advance_minutes", { mode: "number" }),

	// on update will be calculated from delivery_settings
	delivery_minTimeInAdvance_minutes: integer("delivery_min_time_in_advance_minutes", { mode: "number" }),
	delivery_maxTimeInAdvance_minutes: integer("delivery_max_time_in_advance_minutes", { mode: "number" }),

	pickup_settings: text('pickup_settings', { mode: 'json' }).$type<ScheduledOrdersSettings>(), // form helper
	delivery_settings: text('delivery_settings', { mode: 'json' }).$type<ScheduledOrdersSettings>(), // form helper 
});
export const selectRestaurantScheduledOrdersSettingsSchema = createSelectSchema(restaurantScheduledOrdersSettingsTable);
export const insertRestaurantScheduledOrdersSettingsSchema = createInsertSchema(restaurantScheduledOrdersSettingsTable, {
	pickup_settings: z.custom<ScheduledOrdersSettings>((_val) => true),
	delivery_settings: z.custom<ScheduledOrdersSettings>((_val) => true),
});
export const updateRestaurantScheduledOrdersSettingsSchema = createUpdateSchema(restaurantScheduledOrdersSettingsTable, {
	pickup_settings: z.custom<ScheduledOrdersSettings>((_val) => true),
	delivery_settings: z.custom<ScheduledOrdersSettings>((_val) => true),
});
/// RESTAURANT SCHEDULED ORDERS SETTINGS TABLE END








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
	tableReservationSettings:
		one(
			restaurantTableReservationSettingsTable, {
			fields: [restaurantTable.id],
			references: [restaurantTableReservationSettingsTable.restaurantId]
		}),
	taxSettings:
		one(
			restaurantTaxSettingsTable, {
			fields: [restaurantTable.id],
			references: [restaurantTaxSettingsTable.restaurantId]
		}),
	scheduledOrdersSettings:
		one(
			restaurantScheduledOrdersSettingsTable, {
			fields: [restaurantTable.id],
			references: [restaurantScheduledOrdersSettingsTable.restaurantId]
		}),
	deliveryZones:
		one(
			restaurantDeliveryZoneMapTable, {
			fields: [restaurantTable.id],
			references: [restaurantDeliveryZoneMapTable.restaurantId]
		}),
}));