import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from 'drizzle-orm';
import { z } from 'zod';
import { generateKey } from "@lib/utils/generateKey";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import {
	type EstimatedTime,
	EstimatedTimeSchema,
	type DeliveryZone,
	DeliveryZoneSchema
} from "@lib/zod/deliverySchema";
import {
	type PhysicalPaymentMethods,
	PhysicalPaymentMethodsSchema
} from "@lib/zod/paymentMethodsSchema";
import { TAX_TYPE, TaxCategorySchema, type TaxCategory } from "@lib/zod/taxSchema";
import { WeeklyHoursSchema, type WeeklyHours } from "@lib/zod/weeklyScheduleSchema";
import { AutoprintRulesListSchema, type AutoprintRulesListType } from "@lib/zod/AutoprintRules";
import { MenuRootSchema, type MenuRoot } from "@lib/zod/menuRootSchema";
import { autoCreated, autoCreatedUpdated } from "./helpers/auto-created-updated";
import { CustomServiceFeeSchema, type CustomServiceFee, CALCULATION_TYPE } from "@lib/zod/serviceFee";
import { autoprintDeviceStoreMapTable } from "./autoprint.schema";

/// STORE TABLE START
export const storeTable = sqliteTable("store", {
	...autoCreatedUpdated,
	id: text("id").notNull().primaryKey().unique().$defaultFn(() => generateKey('str')),

	name: text("name", { mode: 'text', length: 510 }).notNull(),

	defaultPhoneNumber: text("default_phone_number"),
	extraPhoneNumbers: text("extra_phone_numbers", { mode: 'json' }).$type<string[]>().$defaultFn(() => []),

	cuisines: text("cuisines", { mode: 'json' }).$type<string[]>().$defaultFn(() => []),

	offersPickup: integer("offers_pickup", { mode: "boolean" }).notNull().default(false),
	defaultEstimatedPickupTime: text("default_estimated_pickup_time", { mode: 'json' }).$type<EstimatedTime>(),

	offersDelivery: integer("offers_delivery", { mode: "boolean" }).notNull().default(false),
	defaultEstimatedDeliveryTime: text("default_estimated_delivery_time", { mode: 'json' }).$type<EstimatedTime>(),

	ownerTeamId: text("owner_team_id").notNull(),
	supportTeamId: text("support_team_id"), // website team can become support team for other stores with their owner team id

});

export const selectStoreSchema = createSelectSchema(storeTable);
const overrideStoreTableSchema = {
	name: z.string().min(3, { message: "min 3" }).max(510, { message: "max 510" }),
	extraPhoneNumbers: z.array(z.string()).default([]),
	cuisines: z.array(z.string()).default([]),
	defaultEstimatedPickupTime: EstimatedTimeSchema.nullable(),
	defaultEstimatedDeliveryTime: EstimatedTimeSchema.nullable(),
}
export const insertStoreSchema = createInsertSchema(storeTable, overrideStoreTableSchema);
export const updateStoreSchema = createUpdateSchema(storeTable, overrideStoreTableSchema);
/// STORE TABLE END





export const storeRecentlyUpdatedTable = sqliteTable("store_recently_updated", {
	storeId: text("store_id").notNull().unique(),
	...autoCreated,
});



export const storeStripeConnectSettingsTable = sqliteTable("store_stripe_connect_settings", {
	storeId: text("store_id").notNull().unique(),
	stripeConnectAccountId: text("stripe_connect_account_id"), // not allowed to change by store admins
	isStripeEnabled: integer("is_stripe_enabled", { mode: "boolean" }).notNull().default(false),
	stripeRatePerOrder: real("stripe_rate_per_order"),
	stripeFeePerOrder: real("stripe_fee_per_order"),
	whoPaysStripeFee: text('who_pays_stripe_fee', { enum: ["STORE", "CUSTOMER"] }).notNull().default("STORE"),
	// IF STORE, CALCULATION WILL ONLY SHOW STRIPE FEE IN BREAKDOWN
	// IF CUSTOMER, CALCULATION WILL ADD STRIPE FEE TO ORDER TOTAL AND SHOW STRIPE FEES
});
export const selectStoreStripeConnectSettingsSchema = createSelectSchema(storeStripeConnectSettingsTable);
export const insertStoreStripeConnectSettingsSchema = createInsertSchema(storeStripeConnectSettingsTable);
export const updateStoreStripeConnectSettingsSchema = createUpdateSchema(storeStripeConnectSettingsTable);


export const storeAsAStripeCustomerTable = sqliteTable("store_as_a_stripe_customer", {
	...autoCreatedUpdated,
	storeId: text("store_id").notNull().unique(),
	stripeCustomerId: text("stripe_customer_id"),
	hasChargablePaymentMethod: integer("has_chargable_payment_method", { mode: "boolean" }).notNull().default(false),
	lastVerifiedPaymentMethodId: text("last_verified_payment_method_id"),
	paymentMethodDetails: text("payment_method_details", { mode: 'json' }).$type<any>(),
});
export const selectStoreAsAStripeCustomerSchema = createSelectSchema(storeAsAStripeCustomerTable);
export const insertStoreAsAStripeCustomerSchema = createInsertSchema(storeAsAStripeCustomerTable);
export const updateStoreAsAStripeCustomerSchema = createUpdateSchema(storeAsAStripeCustomerTable);


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









/// STORE SERVICE FEES TABLE START
export const storeServiceFeesTable = sqliteTable('store_service_fees', {
	storeId: text("store_id").notNull().unique(),
	calculationType: text('calculation_type', { enum: CALCULATION_TYPE }),
	tolerableServiceFeeRate: real('tolerable_service_fee_rate'),
	offerDiscountIfPossible: integer("offer_discount_if_possible", { mode: "boolean" }).notNull().default(false),
	customServiceFees: text('custom_service_fees', { mode: 'json' }).$type<CustomServiceFee[]>().$defaultFn(() => []),
});
export const selectStoreServiceFeesSchema = createSelectSchema(storeServiceFeesTable);
export const insertStoreServiceFeesSchema = createInsertSchema(storeServiceFeesTable, {
	tolerableServiceFeeRate: z.number().min(0).max(100).nullable(),
	customServiceFees: z.array(CustomServiceFeeSchema).default([]),
});
export const updateStoreServiceFeesSchema = createUpdateSchema(storeServiceFeesTable, {
	tolerableServiceFeeRate: z.number().min(0).max(100).nullable(),
	customServiceFees: z.array(CustomServiceFeeSchema).default([]),
});
/// STORE SERVICE FEES TABLE END










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
	salesTaxType: text('sales_tax_type', { enum: TAX_TYPE }),
	taxName: text('tax_name'),
	taxRateForDelivery: real('tax_rate_for_delivery'),
	taxRateForServiceFees: real('tax_rate_for_service_fees'),
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


/// AUTOPRINT RULES START
export const storeAutomationRulesTable = sqliteTable("store_automation_rules", {
	storeId: text("store_id").notNull().unique(),
	autoAcceptOrders: integer("auto_accept_order_after_print", { mode: "boolean" }).notNull().default(false),
	autoPrintRules: text('auto_print_rules', { mode: 'json' }).$type<AutoprintRulesListType>(),
});
export const selectStoreAutomationRulesSchema = createSelectSchema(storeAutomationRulesTable);
const overrideStoreAutomationRulesSchema = {
	autoPrintRules: AutoprintRulesListSchema.nullable(),
}
export const insertStoreAutomationRulesSchema = createInsertSchema(storeAutomationRulesTable, overrideStoreAutomationRulesSchema);
export const updateStoreAutomationRulesSchema = createUpdateSchema(storeAutomationRulesTable, overrideStoreAutomationRulesSchema);
/// AUTOPRINT RULES END






export const storeRelations = relations(storeTable, ({
	one,
	many
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
	serviceFees:
		one(
			storeServiceFeesTable, {
			fields: [storeTable.id],
			references: [storeServiceFeesTable.storeId]
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
	automationRules:
		one(
			storeAutomationRulesTable, {
			fields: [storeTable.id],
			references: [storeAutomationRulesTable.storeId]
		}),
	stripeSettings:
		one(
			storeStripeConnectSettingsTable, {
			fields: [storeTable.id],
			references: [storeStripeConnectSettingsTable.storeId]
		}),
	asStripeCustomer:
		one(
			storeAsAStripeCustomerTable, {
			fields: [storeTable.id],
			references: [storeAsAStripeCustomerTable.storeId]
		}),
	autoprintDeviceMap: many(autoprintDeviceStoreMapTable),
}));