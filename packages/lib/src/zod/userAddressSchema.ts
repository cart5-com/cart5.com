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
    city: z.string(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    dropoffOption: z.enum(dropoffOptions).optional(),
    //Instructions for delivery person
    instructionsForDelivery: z.string().optional(), // e.g. "Leave at the door" #BUZZ, building name, etc.
    label: z.string().optional(),
    icon: z.string().optional(), // import { MapPin, House, Building, Hotel, Bed, Factory, BriefcaseBusiness, School, University, Landmark, Store, Castle, Hospital } from 'lucide-vue-next';
})
export type AddressType = z.infer<typeof addressSchema>;


export const addressesSchema = z.record(z.string(), addressSchema).nullable();
export type AddressesType = z.infer<typeof addressesSchema>;

