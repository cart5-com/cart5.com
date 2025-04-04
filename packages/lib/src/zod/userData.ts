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

