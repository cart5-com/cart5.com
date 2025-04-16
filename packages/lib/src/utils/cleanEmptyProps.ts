export function cleanEmptyProps(obj: Record<string, any>) {
    if (!obj || typeof obj !== 'object') return obj;

    const result: Record<string, any> = Array.isArray(obj) ? [] : {};

    for (const key in obj) {
        // Skip if property doesn't belong to the object itself
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

        const value = obj[key];

        // Skip empty strings
        if (value === '') continue;

        // Recursively clean nested objects/arrays
        if (value !== null && typeof value === 'object') {
            const cleaned = cleanEmptyProps(value);
            // Only add non-empty objects/arrays
            if (Object.keys(cleaned).length > 0 || Array.isArray(cleaned)) {
                result[key] = cleaned;
            }
        } else {
            // Add non-empty primitive values
            result[key] = value;
        }
    }

    return result;
}

