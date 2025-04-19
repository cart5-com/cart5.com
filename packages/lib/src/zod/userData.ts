import { z } from "zod";

export const addressSchema = z.object({
    addressId: z.string().optional(),
    icon: z.string().optional(), // import { MapPin, House, Building, Hotel, Bed, Factory, BriefcaseBusiness, School, University, Landmark, Store, Castle, Hospital } from 'lucide-vue-next';
    nickname: z.string().optional(), // 
    label: z.string().optional(),
    country: z.string().optional(),
    address1: z.string().optional(),
    address2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    //Instructions for delivery person
    instructionsForDelivery: z.string().optional(), // e.g. "Leave at the door" #BUZZ, building name, etc.

    // TODO: before order check against the user's phone verified numbers
    verifiedPhone: z.string(), // selection from user verified phone numbers
})
export type UserAddress = z.infer<typeof addressSchema>;

export const addressesSchema = z.array(addressSchema).nullable();
export type UserAddressArray = z.infer<typeof addressesSchema>;

