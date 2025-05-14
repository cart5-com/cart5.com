import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";
import { relations } from 'drizzle-orm';
import { autoCreatedUpdated } from "./helpers/auto-created-updated";
import { ORDER_TYPE } from "@lib/types/orderType";
import { ORDER_STATUS, ORDER_STATUS_OBJ } from "@lib/types/orderStatus";
import { ORDER_STATUS_CHANGED_BY } from "@lib/types/orderStatusChangedByEnum";
import { generateKey } from "@lib/utils/generateKey";
import { generateNumberOnlyOtp } from "@api-hono/utils/generateRandomOtp";
import type { OrderedItemsType } from "@lib/types/orderedItemsType";
import type { calculateSubTotal } from "@lib/utils/calculateSubTotal";
import type { calculateCartBreakdown } from "@lib/utils/calculateCartBreakdown";
import type { AddressType } from "@lib/zod/userAddressSchema";
import type { TaxSettings } from "@lib/zod/taxSchema";
import type { calculateCartTotalPrice } from "@lib/utils/calculateCartItemPrice";
import type { PaymentMethodType } from "@lib/types/paymentMethodType";
// import { z } from 'zod';
import { createSelectSchema } from "drizzle-zod";
import type { EstimatedTime } from "@lib/zod/deliverySchema";
import type { Cart } from "@lib/zod/cartItemState";

export const orderTable = sqliteTable("orders", {
    ...autoCreatedUpdated, // created_at_ts is the visible one I changed it once online payment verified.
    real_created_at_ts: integer("real_created_at_ts")
        .notNull().default(0).$defaultFn(() => Date.now()), // TODO: remove default when sql remove

    orderId: text("order_id").notNull().primaryKey().unique().$defaultFn(() => generateKey('ord')),
    shortOtp: text("short_otp").notNull().$defaultFn(() => generateNumberOnlyOtp(6)),

    // Order Details
    orderType: text("order_type", { enum: ORDER_TYPE }),
    orderNote: text("order_note"),

    // Order Status
    orderStatus: text("order_status", { enum: ORDER_STATUS }).notNull().default(ORDER_STATUS_OBJ.CREATED),

    // Customer Information
    userId: text("user_id").notNull(),
    userName: text("user_name").notNull().default(''),
    userEmail: text("user_email").notNull(),
    userVerifiedPhoneNumbers: text("user_verified_phone_number").notNull(), // .join('|')

    // Website Information
    websiteId: text("website_id").notNull(),
    websiteDefaultHostname: text("website_default_hostname").notNull(),
    supportTeamWebsiteId: text("support_team_website_id"),
    supportTeamWebsiteDefaultHostname: text("support_team_website_default_hostname"),

    // Store Information
    storeId: text("store_id").notNull(),
    storeName: text("store_name").notNull(),
    storeAddress1: text("store_address1").notNull(),
    storeLocationLat: real("store_location_lat").notNull(),
    storeLocationLng: real("store_location_lng").notNull(),
    storeTimezone: text("store_timezone"),

    // Pickup Information
    pickupNickname: text("pickup_nickname").notNull(),

    // Payment Information
    paymentId: text("payment_id").notNull(),
    isOnlinePayment: integer("is_online_payment", { mode: "boolean" }).notNull().default(false),
    isOnlinePaymentVerified: integer("is_online_payment_verified", { mode: "boolean" }),
    finalAmount: real("final_amount").notNull(),

    // JSON Data
    paymentMethodJSON: text("payment_method_json", { mode: "json" }).$type<PaymentMethodType>(),
    estimatedTimeJSON: text("estimated_time_json", { mode: "json" }).$type<EstimatedTime>(),
    orderedItemsJSON: text("ordered_items_json", { mode: "json" }).$type<OrderedItemsType>(),
    cartTotalsJSON: text("cart_total_json", { mode: "json" }).$type<ReturnType<typeof calculateCartTotalPrice>>(),
    subtotalJSON: text("subtotal_json", { mode: "json" }).$type<ReturnType<typeof calculateSubTotal>>(),
    cartBreakdownJSON: text("cart_breakdown_json", { mode: "json" }).$type<ReturnType<typeof calculateCartBreakdown>>(),
    deliveryAddressJSON: text("delivery_address_json", { mode: "json" }).$type<AddressType>(),
    taxSettingsJSON: text("tax_settings_json", { mode: "json" }).$type<TaxSettings>(),
    currentCartJSON: text("current_cart_json", { mode: "json" }).$type<Cart>(),
});

export const orderStripeDataTable = sqliteTable("order_stripe_data", {
    ...autoCreatedUpdated,
    orderId: text("order_id").notNull().primaryKey().unique(),
    checkoutSessionId: text("checkout_session_id"),
    checkoutSessionStatus: text("checkout_session_status"),
    paymentIntentId: text("payment_intent_id"),
    paymentIntentStatus: text("payment_intent_status"),
    storeStripeConnectAccountId: text("store_stripe_connect_account_id"),
});

export const orderStatusHistoryTable = sqliteTable("order_status_history", {
    ...autoCreatedUpdated,
    id: text("id").notNull().primaryKey().unique().$defaultFn(() => generateKey('osh')),
    // Order Information
    orderId: text("order_id").notNull(),
    // Status Information
    newStatus: text("new_status", { enum: ORDER_STATUS }).notNull(),
    // Change Information
    type: text("type", { enum: ORDER_STATUS_CHANGED_BY }),
    changedByUserId: text("changed_by_user_id"),
    changedByIpAddress: text("changed_by_ip_address"),

    // Additional Data
    metaData: text("meta_data", { mode: "json" }), // For any additional data we might want to store
});

export const selectOrderSchema = createSelectSchema(orderTable);

export const orderRelations = relations(orderTable, ({
    // one,
    many
}) => ({
    statusHistory: many(orderStatusHistoryTable),
}));

export const orderStatusHistoryRelations = relations(orderStatusHistoryTable, ({
    one
}) => ({
    order: one(orderTable, {
        fields: [orderStatusHistoryTable.orderId],
        references: [orderTable.orderId],
    }),
}));
