
/**
 * Deep merges two objects recursively
 * @param target The target object to merge into
 * @param source The source object to merge from
 * @returns A new merged object
 */
export function deepMerge<T extends object, S extends object>(target: T, source: S): T & S {
    const output = { ...target } as T & S;

    if (isObject(source) && isObject(target)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key as keyof S])) {
                if (!(key in target)) {
                    Object.assign(output, { [key]: source[key as keyof S] });
                } else {
                    output[key as keyof (T & S)] = deepMerge(
                        target[key as keyof T] as object,
                        source[key as keyof S] as object
                    ) as any;
                }
            } else {
                Object.assign(output, { [key]: source[key as keyof S] });
            }
        });
    }

    return output;
}

function isObject(item: any): item is object {
    return item && typeof item === 'object' && !Array.isArray(item);
}


// not needed anymore because we're showing and CRUDing addresses for only server users.
// anon users don't have addresses.
// export const mergeAddresses = (anonAddresses: UserAddressArray, serverAddresses: UserAddressArray) => {
//     // merge using by detecting duplicates by isAddressDuplicate
//     const mergedAddresses = [...(serverAddresses || [])];
//     anonAddresses?.forEach(anonAddress => {
//         if (!isAddressDuplicate(anonAddress, mergedAddresses)) {
//             mergedAddresses.push(anonAddress);
//         }
//     });
//     return mergedAddresses;
// }


// /**
//  * Checks if an address is a duplicate of any in the existing array
//  * by comparing significant fields (not just the ID)
//  */
// export function isAddressDuplicate(address: UserAddress, existingAddresses: UserAddress[]): boolean {
//     if (!address) return false;

//     return existingAddresses.some(existing => {
//         // Skip empty addresses
//         if (!existing) return false;

//         // Consider significant fields for comparison
//         // Normalize strings for more reliable comparison (trim whitespace, lowercase)
//         const normalizeStr = (s: string | undefined) =>
//             (s || "").trim().toLowerCase();

//         // Compare key fields that would indicate the same physical address
//         return (
//             normalizeStr(address.address1) === normalizeStr(existing.address1) &&
//             normalizeStr(address.city) === normalizeStr(existing.city) &&
//             normalizeStr(address.state) === normalizeStr(existing.state) &&
//             normalizeStr(address.postalCode) === normalizeStr(existing.postalCode) &&
//             normalizeStr(address.country) === normalizeStr(existing.country)
//         );
//     });
// }