
export type ItemId = string;

export type ParentItemId = ItemId;

export type Item = {
    id?: ItemId;
    lbl?: string; // label, title, name
    dsc?: string; // description
    prc?: number; // price

    cIds?: ItemId[]; // children ids

    opPrc?: number; // option price

    chrgAbvQ?: number; // charge above quantity

    defQ?: number; // pre selected/default quantity

    maxQ?: number; // max quantity
    minQ?: number; // min quantity

    // type
    // item, category, customization, option
    // item:i, category:ct, customization:c, option:o
    // i, ct, c, o
    t?: 'i' | 'ct' | 'c' | 'o';

    // imgUrl?: string;
}

export type CartChildrenItemState = {
    itemId?: ItemId;
    childrenState?: ({
        itemId?: ItemId;
        quantity?: number;
        childrenState?: (CartChildrenItemState[])[];
    } | null)[];
}

export type CartItem = {
    itemId?: ItemId;
    quantity?: number;
    childrenState?: CartChildrenItemState[];
}

export type MenuRoot = {
    children?: ItemId[];
    allItems?: Record<string, Item>;
}

export const recursiveCartChildrenItemState = (customizationState: CartChildrenItemState, menuRoot: MenuRoot) => {
    let total = 0;
    if (customizationState.itemId) {
        if (customizationState.childrenState) {
            for (const optionIndex in customizationState.childrenState) {
                const optionItem = menuRoot.allItems?.[customizationState.childrenState[optionIndex]?.itemId!];
                if (customizationState.childrenState[optionIndex]?.itemId) {
                    const quantity = customizationState.childrenState[optionIndex]?.quantity || 0;
                    if (optionItem?.opPrc) {
                        let chargeableQuantity = quantity;

                        // Handle chargeAboveQuantity
                        if (optionItem.chrgAbvQ !== undefined) {
                            chargeableQuantity = Math.max(0, quantity - optionItem.chrgAbvQ);
                        }

                        // Calculate base price
                        total += (optionItem.opPrc || 0) * chargeableQuantity;
                    }
                    if (customizationState.childrenState[optionIndex].childrenState) {
                        for (const quantityRepeatedChildStateIndex in customizationState.childrenState[optionIndex].childrenState) {
                            if (customizationState.childrenState[optionIndex].childrenState[quantityRepeatedChildStateIndex]) {
                                for (const childStateIndex in customizationState.childrenState[optionIndex].childrenState[quantityRepeatedChildStateIndex]) {
                                    const deepOptionSetState = customizationState.childrenState[optionIndex].childrenState[quantityRepeatedChildStateIndex][childStateIndex]
                                    total += recursiveCartChildrenItemState(deepOptionSetState, menuRoot)
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

export const calculateCartItemPrice = (cartItem: CartItem, menuRoot: MenuRoot) => {
    let total = 0;
    if (cartItem.itemId) {
        const item = menuRoot.allItems?.[cartItem.itemId];
        if (item) {
            total += (item.prc || 0);
        }
    }
    if (cartItem.childrenState) {
        for (const index in cartItem.childrenState) {
            const optionSetState = cartItem.childrenState[index];
            total += recursiveCartChildrenItemState(optionSetState, menuRoot)
        }
    }
    if (total < 0) {
        total = 0;
    }
    return (total * (cartItem.quantity || 1)).toFixed(2);
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