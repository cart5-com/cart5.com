
export type ItemId = string;

export type ParentItemId = ItemId;

export type Item = {
    itemId?: ItemId;
    itemLabel?: string;
    description?: string;
    price?: number;
    children?: ItemId[];
    priceOverrides?: Record<ParentItemId, number>;
    maxQuantity?: number;
    minQuantity?: number;

    type?: 'item' | 'category' | 'customization' | 'option';
    // TODO:
    // preSelectedQuantities?: Record<ParentItemId, number>; 
    // maxQuantityOverrides?: Record<ParentItemId, number>;
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

export const recursiveBucketChildrenState = (optionSetState: BucketChildrenState, menuRoot: MenuRoot) => {
    let total = 0;
    if (optionSetState.itemId) {
        // const item = menuRoot.allItems?.[optionSetState.itemId];
        if (optionSetState.childrenState) {
            for (const optionIndex in optionSetState.childrenState) {
                if (optionSetState.childrenState[optionIndex].itemId) {
                    const optionItem = menuRoot.allItems?.[optionSetState.childrenState[optionIndex].itemId];
                    if (
                        optionItem?.priceOverrides &&
                        optionItem?.priceOverrides[optionSetState.itemId] &&
                        optionSetState.childrenState[optionIndex].quantity
                    ) {
                        total += (optionItem?.priceOverrides[optionSetState.itemId] || 0) *
                            optionSetState.childrenState[optionIndex].quantity
                        if (optionSetState.childrenState[optionIndex].childrenState) {
                            for (const quantityRepeatedChildStateIndex in optionSetState.childrenState[optionIndex].childrenState) {
                                if (optionSetState.childrenState[optionIndex].childrenState[quantityRepeatedChildStateIndex]) {
                                    for (const childStateIndex in optionSetState.childrenState[optionIndex].childrenState[quantityRepeatedChildStateIndex]) {
                                        const deepOptionSetState = optionSetState.childrenState[optionIndex].childrenState[quantityRepeatedChildStateIndex][childStateIndex]
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

export const sampleMenuRoot: MenuRoot = {
    children: [
        "combos-1",
        "burgers-1",
        "sides-1",
        "drinks-1",
    ],
    allItems: {
        "combos-1": {
            itemId: "combos-1",
            itemLabel: "Combos",
            children: [
                "combo-1",
            ],
        },
        "burgers-1": {
            itemId: "burgers-1",
            itemLabel: "Burgers",
            children: [
                "burger-1",
                "burger-2",
            ],
        },
        "sides-1": {
            itemId: "sides-1",
            itemLabel: "Sides",
            maxQuantity: 1,
            children: [
                "side-1",
                "side-2",
                "side-3",
            ],
        },
        "drinks-1": {
            itemId: "drinks-1",
            itemLabel: "Drinks",
            children: [
                "drink-1",
                "drink-2",
            ],
        },
        "burger-1": {
            itemId: "burger-1",
            itemLabel: "Burger",
            price: 12,
            priceOverrides: {
                "burgers-1": 8
            },
            children: [
                "sides-1",
                "drinks-1",
            ],
        },
        "burger-2": {
            itemId: "burger-2",
            itemLabel: "Cheeseburger",
            price: 14,
            priceOverrides: {
                "burgers-1": 10
            },
            children: [
                "sides-1",
                "drinks-1",
            ],
        },
        "combo-1": {
            itemId: "combo-1",
            itemLabel: "Combo",
            price: 10,
            children: [
                "burgers-1",
            ],
        },
        "side-1": {
            itemId: "side-1",
            itemLabel: "Small Fries",
            price: 2,
            children: [
                "customize-fries",
            ],
        },
        "side-2": {
            itemId: "side-2",
            itemLabel: "Medium Fries",
            price: 3,
            children: [
                "customize-fries",
            ],
        },
        "side-3": {
            itemId: "side-3",
            itemLabel: "Large Fries",
            price: 4,
            children: [
                "customize-fries",
            ],
        },
        "drink-1": {
            itemId: "drink-1",
            itemLabel: "Soda",
            price: 1.2,
        },
        "drink-2": {
            itemId: "drink-2",
            itemLabel: "Water",
            price: 1,
        },
        "salt-1": {
            itemId: "salt-1",
            itemLabel: "Salt",
            price: 0,
        },
        "pepper-1": {
            itemId: "pepper-1",
            itemLabel: "Pepper",
            price: 0,
        },
        "ketchup-1": {
            itemId: "ketchup-1",
            itemLabel: "Ketchup",
            price: 0.2,
        },
        "customize-fries": {
            itemId: "customize-fries",
            itemLabel: "Customize Fries",
            children: [
                "salt-1",
                "pepper-1",
                "ketchup-1",
            ],
        },
    },
}