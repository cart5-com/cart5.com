import { sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { autoCreatedUpdated } from "./helpers/auto-created-updated";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import {
    type Carts, cartsSchema,
} from "@lib/zod/cartItemState";
import { type AddressesType, addressesSchema } from "@lib/zod/userAddressSchema";
import { z } from "zod";
export const userDataTable = sqliteTable("user_data", {
    ...autoCreatedUpdated,
    userId: text("user_id")
        .notNull().unique(),
    rememberLastLat: real("remember_last_lat"),
    rememberLastLng: real("remember_last_lng"),
    rememberLastAddress: text("remember_last_address"),
    rememberLastCountry: text("remember_last_country"),

    rememberLastNickname: text("remember_last_nickname"),

    rememberLastAddressId: text("remember_last_address_id"),
    addresses: text("addresses", { mode: 'json' }).$type<AddressesType>(),

    carts: text("carts", { mode: 'json' }).$type<Carts>(),
});

const overrideSchema = {
    rememberLastNickname: z.string().max(255).optional().nullable(),
    carts: cartsSchema,
    addresses: addressesSchema,
}
export const selectUserDataSchema = createSelectSchema(userDataTable);
export const insertUserDataSchema = createInsertSchema(userDataTable, overrideSchema);
export const updateUserDataSchema = createUpdateSchema(userDataTable, overrideSchema);
