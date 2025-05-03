import type {
    CartItem,
    CartChildrenItemState
} from "@lib/zod/cartItemState";
import type { MenuRoot } from "@lib/zod/menuRootSchema";

export const verifyCartItemState = (
    cartItem: CartItem,
    menuRoot: MenuRoot
): boolean => {
    if (cartItem.quantity && cartItem.quantity > 100) {
        return false;
    }
    const item = menuRoot.allItems?.[cartItem.itemId!];
    if (cartItem.childrenState) {
        for (const index in cartItem.childrenState) {
            const optionSetState = cartItem.childrenState[index];
            if (optionSetState && optionSetState?.itemId) {
                if (!item?.cIds?.includes(optionSetState?.itemId)) {
                    return false;
                }
                return verifyRecursiveChildrenState(optionSetState, menuRoot)
            }
        }
    }
    return true;
};

const getTotalQuantity = (customizationState: CartChildrenItemState) => {
    const itemState = JSON.parse(JSON.stringify(customizationState.childrenState || [])) as CartChildrenItemState['childrenState']
    return itemState!
        .filter(item => item !== null && item !== undefined)
        .reduce((acc, curr) => acc + (curr?.quantity || 0), 0);
}

const verifyRecursiveChildrenState = (
    customizationState: CartChildrenItemState, menuRoot: MenuRoot
): boolean => {
    if (customizationState.itemId) {
        const item = menuRoot.allItems?.[customizationState.itemId];
        if (item) {
            if (item.maxQ) {
                const totalQuantity = getTotalQuantity(customizationState);
                if (totalQuantity > item.maxQ) {
                    return false;
                }
            }
            if (item.minQ) {
                const totalQuantity = getTotalQuantity(customizationState);
                if (totalQuantity < item.minQ) {
                    return false;
                }
            }
            if (customizationState.childrenState) {
                for (const optionIndex in customizationState.childrenState) {
                    if (customizationState.childrenState[optionIndex]?.itemId) {
                        if (!item?.cIds?.includes(customizationState.childrenState[optionIndex]?.itemId)) {
                            return false;
                        }
                        const optionItem = menuRoot.allItems?.[customizationState.childrenState[optionIndex]?.itemId!];
                        if (optionItem) {
                            if (optionItem.maxQ) {
                                const optionQuantity = customizationState.childrenState[optionIndex]?.quantity;
                                if (optionQuantity && optionQuantity > optionItem.maxQ) {
                                    return false;
                                }
                            }
                        }
                        if (customizationState.childrenState[optionIndex].childrenState) {
                            for (const quantityRepeatedChildStateIndex in customizationState.childrenState[optionIndex].childrenState) {
                                if (customizationState.childrenState[optionIndex].childrenState[quantityRepeatedChildStateIndex]) {
                                    for (const childStateIndex in customizationState.childrenState[optionIndex].childrenState[quantityRepeatedChildStateIndex]) {
                                        const deepOptionSetState = customizationState.childrenState[optionIndex].childrenState[quantityRepeatedChildStateIndex][childStateIndex]
                                        if (deepOptionSetState) {
                                            const isValid = verifyRecursiveChildrenState(deepOptionSetState, menuRoot);
                                            if (!isValid) return false;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return true;
};
