import { z } from "zod";

export const dropoffOptions = [
    'MEET_AT_MY_DOOR',
    'MEET_OUTSIDE',
    'MEET_IN_THE_LOBBY',
    'LEAVE_AT_MY_DOOR',
    'LEAVE_AT_BUILDING_RECEPTION',
] as const;

export const addressSchema = z.object({
    addressId: z.string(),
    country: z.string(),
    address1: z.string(),
    address2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    dropoffOption: z.enum(dropoffOptions).optional(),
    instructionsForDelivery: z.string().optional(),
    label: z.string().optional(),
    icon: z.string().optional(),
    phoneNumber: z.string().optional(),
    nickname: z.string().optional(),
    lastUpdatedTS: z.number().optional(),
})
export type AddressType = z.infer<typeof addressSchema>;


export const addressesSchema = z.record(z.string(), addressSchema).nullable();
export type AddressesType = z.infer<typeof addressesSchema>;

