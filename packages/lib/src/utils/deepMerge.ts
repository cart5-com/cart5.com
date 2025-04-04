
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