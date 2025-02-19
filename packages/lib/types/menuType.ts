
export type ItemId = string;

export type ParentItemId = ItemId;

export type Item = {
    itemId?: ItemId;
    itemLabel?: string;
    description?: string;
    price?: number;

    children?: ItemId[];

    optionPrice?: number;

    chargeAboveQuantity?: number;


    preSelectedQuantity?: number;

    maxQuantity?: number;
    minQuantity?: number;
    type?: 'item' | 'category' | 'customization' | 'option';

    // TODO:
    imageUrl?: string;
}

export type BucketChildrenState = {
    itemId?: ItemId;
    childrenState?: {
        itemId?: ItemId;
        quantity?: number;
        childrenState?: (BucketChildrenState[])[];
    }[];
    // childrenState?: Record<ItemId, {
    //     quantity?: number;
    //     childrenState?: (BucketChildrenState[])[];
    // }>;
}

export type BucketItem = {
    itemId?: ItemId;
    quantity?: number;
    childrenState?: BucketChildrenState[];
}

export type MenuRoot = {
    children?: ItemId[];
    allItems?: Record<string, Item>;
}

export const recursiveBucketChildrenState = (customizationState: BucketChildrenState, menuRoot: MenuRoot) => {
    let total = 0;
    if (customizationState.itemId) {
        if (customizationState.childrenState) {
            for (const optionIndex in customizationState.childrenState) {
                const optionItem = menuRoot.allItems?.[customizationState.childrenState[optionIndex].itemId!];
                if (customizationState.childrenState[optionIndex].itemId) {
                    const quantity = customizationState.childrenState[optionIndex].quantity || 0;
                    if (optionItem?.optionPrice) {
                        let chargeableQuantity = quantity;

                        // Handle chargeAboveQuantity
                        if (optionItem.chargeAboveQuantity !== undefined) {
                            chargeableQuantity = Math.max(0, quantity - optionItem.chargeAboveQuantity);
                        }

                        // Calculate base price
                        total += (optionItem.optionPrice || 0) * chargeableQuantity;
                    }
                    if (customizationState.childrenState[optionIndex].childrenState) {
                        for (const quantityRepeatedChildStateIndex in customizationState.childrenState[optionIndex].childrenState) {
                            if (customizationState.childrenState[optionIndex].childrenState[quantityRepeatedChildStateIndex]) {
                                for (const childStateIndex in customizationState.childrenState[optionIndex].childrenState[quantityRepeatedChildStateIndex]) {
                                    const deepOptionSetState = customizationState.childrenState[optionIndex].childrenState[quantityRepeatedChildStateIndex][childStateIndex]
                                    total += recursiveBucketChildrenState(deepOptionSetState, menuRoot)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return total;
}

export const calculateBucketItemPrice = (bucketItem: BucketItem, menuRoot: MenuRoot) => {
    // debugger;
    let total = 0;
    if (bucketItem.itemId) {
        const item = menuRoot.allItems?.[bucketItem.itemId];
        if (item) {
            total += (item.price || 0);
        }
    }
    if (bucketItem.childrenState) {
        for (const index in bucketItem.childrenState) {
            const optionSetState = bucketItem.childrenState[index];
            total += recursiveBucketChildrenState(optionSetState, menuRoot)
        }
    }
    if (total < 0) {
        total = 0;
    }
    return (total * (bucketItem.quantity || 1)).toFixed(2);
}


export const cleanEmptyProperties = (menuRoot: MenuRoot) => {
    const cleanedMenuRoot: MenuRoot = JSON.parse(JSON.stringify(menuRoot));
    for (const itemId in cleanedMenuRoot.allItems) {
        const item = cleanedMenuRoot.allItems[itemId];
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