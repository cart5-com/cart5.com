import type {
    MenuRoot
} from "@lib/zod/menuRootSchema";
import { type CartChildrenItemState, type CartItem } from "@lib/zod/cartItemState";

export const recursiveCartChildrenItemSummary = (
    customizationState: CartChildrenItemState,
    menuRoot: MenuRoot,
    indentLevel: number = 0,
    upperOptionIndex?: number,
    upperOptionLength?: number
) => {
    let summary = '';
    if (customizationState.itemId) {
        let newSummary = '';
        if (customizationState.childrenState) {
            // const innerCustomizationItem = menuRoot.allItems?.[customizationState.itemId];
            // let countedQuantity = 0;
            // let ignoreMoreThanMaxQuantity = false;
            for (const optionIndex in customizationState.childrenState) {

                // if null then it means option is removed
                if (customizationState.childrenState[optionIndex] === null) {
                    const innerCustomization = menuRoot.allItems?.[customizationState.itemId];
                    if (innerCustomization && innerCustomization.cIds && innerCustomization.cIds[optionIndex]) {
                        const innerOptionItem = menuRoot.allItems?.[innerCustomization.cIds[optionIndex]];
                        if (innerOptionItem?.defQ) { // default quantity should be 0 to remove
                            let helperText = '';
                            if (upperOptionIndex && upperOptionLength) {
                                helperText = `[${upperOptionIndex}/${upperOptionLength}]`;
                            }
                            newSummary += `${"  ".repeat(indentLevel + 1)}${helperText}0x ${innerOptionItem?.lbl || ''}\n`;
                        }
                        // newSummary += " ".repeat(indentLevel + 1) + nullOptionItem.lbl + ':';
                    }
                }


                const optionItem = menuRoot.allItems?.[customizationState.childrenState[optionIndex]?.itemId!];
                if (customizationState.childrenState[optionIndex]?.itemId) {
                    let quantity = customizationState.childrenState[optionIndex]?.quantity || 0;
                    // countedQuantity += quantity;
                    // if (countedQuantity > innerCustomizationItem?.maxQ!) {
                    //     console.log('countedQuantity > innerCustomizationItem?.maxQ', countedQuantity, innerCustomizationItem?.maxQ);
                    //     // remove diff
                    //     const diff = countedQuantity - innerCustomizationItem?.maxQ!;
                    //     quantity -= diff;
                    //     ignoreMoreThanMaxQuantity = true;
                    // }
                    // TODO: check potential state hacks like this one below: (item can be added more than max quantity)
                    // for example total options quantity can NOT be more than choose up to value
                    if (optionItem?.maxQ && quantity > optionItem?.maxQ) {
                        quantity = optionItem?.maxQ;
                    }
                    // let chargeableQuantity = quantity;
                    // if (optionItem?.chrgAbvQ !== undefined) {
                    //     chargeableQuantity = Math.max(0, quantity - optionItem.chrgAbvQ);
                    // }
                    // if (chargeableQuantity > 0) {
                    //     summary += "    " + chargeableQuantity + 'x ' + (optionItem?.lbl || '') + '\n';
                    // }

                    // if (quantity < 0) {
                    //     return newSummary;
                    // }


                    // const defaultQuantity = optionItem?.defQ || 0;

                    // // Don't use position labels here - they're not needed in this context
                    // if (defaultQuantity !== quantity) {
                    //     newSummary += "  ".repeat(indentLevel + 1) + quantity + 'x ' + (optionItem?.lbl || '') + '\n';

                    //     // Add position tracking for customized items
                    //     if (quantity > 1) {
                    //         for (let i = 1; i <= quantity; i++) {
                    //             if (i === 2) { // Assuming the 2nd item has the customization
                    //                 newSummary += "  ".repeat(indentLevel + 2) + `(${i}/${quantity}) 6x Salt [0.0 Cals]\n`;
                    //             } else {
                    //                 newSummary += "  ".repeat(indentLevel + 2) + `(${i}/${quantity}) no change\n`;
                    //             }
                    //         }
                    //     }
                    // }

                    const defaultQuantity = optionItem?.defQ || 0;
                    if (defaultQuantity !== quantity) {
                        let helperText = '';
                        if (upperOptionIndex && upperOptionLength) {
                            helperText = `[${upperOptionIndex}/${upperOptionLength}]`;
                        }
                        newSummary += `${"  ".repeat(indentLevel + 1)}${helperText}${quantity}x ${optionItem?.lbl || ''}\n`;
                    }


                    if (customizationState.childrenState[optionIndex].childrenState) {
                        for (const quantityRepeatedChildStateIndex in customizationState.childrenState[optionIndex].childrenState) {
                            if (customizationState.childrenState[optionIndex].childrenState[quantityRepeatedChildStateIndex] === null) {
                                const innerCustomization = menuRoot.allItems?.[customizationState.childrenState[optionIndex].itemId];
                                if (innerCustomization && innerCustomization.cIds && innerCustomization.cIds[optionIndex]) {
                                    const innerOptionItem = menuRoot.allItems?.[innerCustomization.cIds[optionIndex]];
                                    if (innerOptionItem?.defQ) {
                                        let helperText = '';
                                        if (upperOptionIndex && upperOptionLength) {
                                            helperText = `[${upperOptionIndex}/${upperOptionLength}]`;
                                        }
                                        newSummary += `${"  ".repeat(indentLevel + 1)}${helperText}0x ${innerOptionItem?.lbl || ''}\n`;
                                    }
                                }
                            }
                            if (customizationState.childrenState[optionIndex].childrenState[quantityRepeatedChildStateIndex]) {
                                for (const childStateIndex in customizationState.childrenState[optionIndex].childrenState[quantityRepeatedChildStateIndex]) {
                                    const deepOptionSetState = customizationState.childrenState[optionIndex].childrenState[quantityRepeatedChildStateIndex][childStateIndex]
                                    if (deepOptionSetState) {
                                        debugger;
                                        newSummary += recursiveCartChildrenItemSummary(
                                            deepOptionSetState,
                                            menuRoot,
                                            indentLevel + 1,
                                            Number(quantityRepeatedChildStateIndex) + 1,
                                            quantity
                                        )
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
                summary += `${" ".repeat(indentLevel)}${menuRoot.allItems?.[customizationState.itemId]?.lbl}\n`;
            }
            summary += newSummary;
        }
    }
    return summary;
}

export const generateCartItemTextSummary = (cartItem: CartItem, menuRoot: MenuRoot) => {
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
