import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { autoCreatedUpdated } from "./helpers/auto-created-updated";
import { type UserAddressArray, addressesSchema } from "@lib/zod/userData";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";

export const userDataTable = sqliteTable("user_data", {
    ...autoCreatedUpdated,
    userId: text("user_id")
        .notNull().unique(),
    rememberLastAddressId: text("remember_last_address_id"),
    addressArray: text("addresses", { mode: 'json' }).$type<UserAddressArray>(),
});


export const selectUserDataSchema = createSelectSchema(userDataTable);
export const insertUserDataSchema = createInsertSchema(userDataTable, {
    addressArray: addressesSchema,
});
export const updateUserDataSchema = createUpdateSchema(userDataTable, {
    addressArray: addressesSchema,
});

