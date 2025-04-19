import { sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { autoCreatedUpdated } from "./helpers/auto-created-updated";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import {
    type Carts, cartsSchema,
} from "@lib/zod/cartItemState";

export const userDataTable = sqliteTable("user_data", {
    ...autoCreatedUpdated,
    userId: text("user_id")
        .notNull().unique(),
    rememberLastLat: real("remember_last_lat"),
    rememberLastLng: real("remember_last_lng"),
    rememberLastAddress: text("remember_last_address"),
    rememberLastCountry: text("remember_last_country"),

    // rememberLastAddressId: text("remember_last_address_id"),
    // addressArray: text("addresses", { mode: 'json' }).$type<UserAddressArray>(),
    carts: text("carts", { mode: 'json' }).$type<Carts>(),
});


export const selectUserDataSchema = createSelectSchema(userDataTable);
export const insertUserDataSchema = createInsertSchema(userDataTable, {
    carts: cartsSchema,
});
export const updateUserDataSchema = createUpdateSchema(userDataTable, {
    carts: cartsSchema,
});


// TODO: user verified phone numbers
