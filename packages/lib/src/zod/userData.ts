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






export const mergeAddresses = (anonAddresses: UserAddressArray, serverAddresses: UserAddressArray) => {
    // merge using by detecting duplicates by isAddressDuplicate
    const mergedAddresses = [...(serverAddresses || [])];
    anonAddresses?.forEach(anonAddress => {
        if (!isAddressDuplicate(anonAddress, mergedAddresses)) {
            mergedAddresses.push(anonAddress);
        }
    });
    return mergedAddresses;
}


/**
 * Checks if an address is a duplicate of any in the existing array
 * by comparing significant fields (not just the ID)
 */
export function isAddressDuplicate(address: UserAddress, existingAddresses: UserAddress[]): boolean {
    if (!address) return false;

    return existingAddresses.some(existing => {
        // Skip empty addresses
        if (!existing) return false;

        // Consider significant fields for comparison
        // Normalize strings for more reliable comparison (trim whitespace, lowercase)
        const normalizeStr = (s: string | undefined) =>
            (s || "").trim().toLowerCase();

        // Compare key fields that would indicate the same physical address
        return (
            normalizeStr(address.address1) === normalizeStr(existing.address1) &&
            normalizeStr(address.city) === normalizeStr(existing.city) &&
            normalizeStr(address.state) === normalizeStr(existing.state) &&
            normalizeStr(address.postalCode) === normalizeStr(existing.postalCode) &&
            normalizeStr(address.country) === normalizeStr(existing.country)
        );
    });
}