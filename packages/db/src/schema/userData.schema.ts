import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { autoCreatedUpdated } from "./helpers/auto-created-updated";
import type { UserAddress } from "@lib/types/UserAddressType";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

export const userDataTable = sqliteTable("user_data", {
    ...autoCreatedUpdated,
    userId: text("user_id")
        .notNull().unique(),
    rememberLastAddressId: text("remember_last_address_id"),
    addresses: text("addresses", { mode: "json" }).$type<UserAddress[]>().default([]),
});

export const selectUserDataSchema = createSelectSchema(userDataTable);
export const insertUserDataSchema = createInsertSchema(userDataTable, {
    addresses: z.array(z.custom<UserAddress>()).optional()
});
export const updateUserDataSchema = createUpdateSchema(userDataTable, {
    addresses: z.array(z.custom<UserAddress>()).optional()
});
