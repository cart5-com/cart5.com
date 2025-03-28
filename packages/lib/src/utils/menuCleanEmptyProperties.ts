import type { Item, MenuRoot } from "@lib/types/menuType";

export const menuCleanEmptyProperties = (menuRoot: MenuRoot) => {
    const cleanedMenuRoot: MenuRoot = JSON.parse(JSON.stringify(menuRoot));
    for (const itemId in cleanedMenuRoot.allItems) {
        const item = cleanedMenuRoot.allItems[itemId];
        if (!item) continue;
        const keys = Object.keys(item) as Array<keyof Item>;

        for (const key of keys) {
            const value = item[key];

            // remove null or undefined
            if (value === null || value === undefined) {
                delete item[key];
                continue;
            }

            // remove empty strings
            if (typeof value === 'string' && value.trim().length === 0) {
                delete item[key];
                continue;
            }

            // remove empty arrays
            if (Array.isArray(value) && value.length === 0) {
                delete item[key];
                continue;
            }

            // remove empty objects
            if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) {
                delete item[key];
            }
        }
    }
    return cleanedMenuRoot;
}

