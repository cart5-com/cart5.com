import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { autoCreatedUpdated } from "./helpers/auto-created-updated";
import { ORDER_TYPE } from "@lib/types/orderType";
import { ORDER_STATUS } from "@lib/types/orderStatus";
import { generateKey } from "@lib/utils/generateKey";
import { generateOTPJsOnly } from "@api-hono/utils/generateRandomOtp";

export const orderTable = sqliteTable("orders", {
    ...autoCreatedUpdated,
    id: text("id").notNull().primaryKey().unique().$defaultFn(() => generateKey('ord')),
    shortOtp: text("short_otp").notNull().$defaultFn(() => generateOTPJsOnly()),

    // Order Details
    orderType: text("order_type", { enum: ORDER_TYPE }).notNull(),
    orderNote: text("order_note"),

    // Order Status
    orderStatus: text("order_status", { enum: ORDER_STATUS }).notNull().default("CREATED"),

    // Customer Information
    userId: text("user_id").notNull(),
    userEmail: text("user_email"),


    orderedItemsJSON: text("ordered_items_json", { mode: "json" }).notNull(),
});

