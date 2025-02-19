
export type ItemId = string;

export type ParentItemId = ItemId;

export type Item = {
    itemId?: ItemId;
    itemLabel?: string;
    description?: string;
    price?: number;

    children?: ItemId[];

    // TODO: move this options itself not parent item
    childrenOverridePrices?: Record<ItemId, number>;
    childrenOverrideMaxQuantities?: Record<ItemId, number>;
    childrenChargeAboveQuantity?: Record<ItemId, number>;

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
                if (customizationState.childrenState[optionIndex].itemId) {
                    if (
                        customizationState.childrenState[optionIndex].quantity
                    ) {
                        const customizationItem = menuRoot.allItems?.[customizationState.itemId];
                        const optionItem = menuRoot.allItems?.[customizationState.childrenState[optionIndex].itemId];
                        if (customizationItem?.childrenOverridePrices &&
                            customizationItem?.childrenOverridePrices[optionItem?.itemId!]
                        ) {
                            if (customizationItem?.childrenChargeAboveQuantity?.[optionItem?.itemId!]) {
                                total += (customizationItem?.childrenOverridePrices[optionItem?.itemId!] || 0) *
                                    (
                                        customizationState.childrenState[optionIndex].quantity -
                                        customizationItem?.childrenChargeAboveQuantity?.[optionItem?.itemId!]
                                    )
                            } else {
                                total += (customizationItem?.childrenOverridePrices[optionItem?.itemId!] || 0) *
                                    customizationState.childrenState[optionIndex].quantity
                            }
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