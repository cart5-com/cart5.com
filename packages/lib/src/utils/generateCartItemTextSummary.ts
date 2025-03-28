import type {
    CartChildrenItemState,
    CartItem,
    MenuRoot
} from "@lib/types/menuType";

export const recursiveCartChildrenItemSummary = (
    customizationState: CartChildrenItemState,
    menuRoot: MenuRoot,
    indentLevel: number = 0
) => {
    let summary = '';
    if (customizationState.itemId) {
        let newSummary = '';
        if (customizationState.childrenState) {
            for (const optionIndex in customizationState.childrenState) {

                // if null then it means option is removed
                if (customizationState.childrenState[optionIndex] === null) {
                    const innerCustomization = menuRoot.allItems?.[customizationState.itemId];
                    if (innerCustomization && innerCustomization.cIds && innerCustomization.cIds[optionIndex]) {
                        const innerOptionItem = menuRoot.allItems?.[innerCustomization.cIds[optionIndex]];
                        if (innerOptionItem?.defQ) {
                            newSummary += "  ".repeat(indentLevel + 1) + 0 + 'x ' + (innerOptionItem?.lbl || '') + '\n';
                        }
                        // newSummary += " ".repeat(indentLevel + 1) + nullOptionItem.lbl + ':';
                    }
                }


                const optionItem = menuRoot.allItems?.[customizationState.childrenState[optionIndex]?.itemId!];
                if (customizationState.childrenState[optionIndex]?.itemId) {
                    const quantity = customizationState.childrenState[optionIndex]?.quantity || 0;
                    const defaultQuantity = optionItem?.defQ || 0;
                    // let chargeableQuantity = quantity;
                    // if (optionItem?.chrgAbvQ !== undefined) {
                    //     chargeableQuantity = Math.max(0, quantity - optionItem.chrgAbvQ);
                    // }
                    // if (chargeableQuantity > 0) {
                    //     summary += "    " + chargeableQuantity + 'x ' + (optionItem?.lbl || '') + '\n';
                    // }
                    if (defaultQuantity !== quantity) {
                        newSummary += "  ".repeat(indentLevel + 1) + quantity + 'x ' + (optionItem?.lbl || '') + '\n';
                    }
                    if (customizationState.childrenState[optionIndex].childrenState) {
                        for (const quantityRepeatedChildStateIndex in customizationState.childrenState[optionIndex].childrenState) {
                            if (customizationState.childrenState[optionIndex].childrenState[quantityRepeatedChildStateIndex] === null) {
                                const innerCustomization = menuRoot.allItems?.[customizationState.childrenState[optionIndex].itemId];
                                if (innerCustomization && innerCustomization.cIds && innerCustomization.cIds[optionIndex]) {
                                    const innerOptionItem = menuRoot.allItems?.[innerCustomization.cIds[optionIndex]];
                                    if (innerOptionItem?.defQ) {
                                        newSummary += "  ".repeat(indentLevel + 1) + 0 + 'x ' + (innerOptionItem?.lbl || '') + '\n';
                                    }
                                }
                            }
                            if (customizationState.childrenState[optionIndex].childrenState[quantityRepeatedChildStateIndex]) {
                                for (const childStateIndex in customizationState.childrenState[optionIndex].childrenState[quantityRepeatedChildStateIndex]) {
                                    const deepOptionSetState = customizationState.childrenState[optionIndex].childrenState[quantityRepeatedChildStateIndex][childStateIndex]
                                    if (deepOptionSetState) {
                                        newSummary += recursiveCartChildrenItemSummary(deepOptionSetState, menuRoot, indentLevel + 1)
                                    }
                                }

                            }
                        }
                    }
                }
            }
        }
        if (newSummary.length > 0) {
            if (menuRoot.allItems?.[customizationState.itemId]?.lbl) {
                summary += " ".repeat(indentLevel) + (menuRoot.allItems?.[customizationState.itemId]?.lbl) + '\n';
            }
            summary += newSummary;
        }
    }
    return summary;
}

export const generateCartItemTextSummary = (cartItem: CartItem, menuRoot: MenuRoot) => {
    console.log('generateCartItemTextSummary📕');
    let summary = '';
    if (cartItem.itemId) {
        const item = menuRoot.allItems?.[cartItem.itemId];
        if (item) {
            // summary += (cartItem.quantity || 1) + 'x ' + item.lbl + '\n';
            // summary += `${cartItem.quantity || 1}x ${item.lbl}\n`;
        }
    }
    if (cartItem.childrenState) {
        for (const index in cartItem.childrenState) {
            const optionSetState = cartItem.childrenState[index];
            if (optionSetState) {
                summary += recursiveCartChildrenItemSummary(optionSetState, menuRoot)
            }
        }
    }
    return summary;
}
