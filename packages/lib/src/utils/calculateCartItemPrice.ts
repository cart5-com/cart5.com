import type { CartChildrenItemState, CartItem, MenuRoot } from "@lib/types/menuType";


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
                                    if (deepOptionSetState) {
                                        total += recursiveCartChildrenItemState(deepOptionSetState, menuRoot)
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

export const calculateCartItemPrice = (cartItem: CartItem, menuRoot: MenuRoot) => {
    console.log('calculateCartItemPrice🤑');
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
            if (optionSetState) {
                total += recursiveCartChildrenItemState(optionSetState, menuRoot)
            }
        }
    }
    if (total < 0) {
        total = 0;
    }
    return (total * (cartItem.quantity || 1)).toFixed(2);
}


