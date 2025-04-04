import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { autoCreatedUpdated } from "./helpers/auto-created-updated";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

export const addressSchema = z.object({
    addressId: z.string().optional(),
    country: z.string().optional(),
    address1: z.string().optional(),
    address2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
})

export const addressesSchema = z.array(addressSchema).nullable();

export type UserAddress = z.infer<typeof addressSchema>;
export type UserAddressArray = z.infer<typeof addressesSchema>;


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
