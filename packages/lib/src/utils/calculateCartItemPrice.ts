import type { ItemId, MenuRoot } from "@lib/types/menuType";
import { type CartChildrenItemState } from "@lib/zod/cartItemState";
import { type CartItem } from "@lib/zod/cartItemState";
import type { OrderType } from "@lib/types/orderType";
import type { TaxSettings } from "@lib/types/taxTypes";
import type { Cart } from "@lib/types/UserLocalStorageTypes";
import { roundTo2Decimals } from "@lib/utils/roundTo2Decimals";

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

export const calculateCartItemTax = (
    price: number,
    itemId: ItemId | undefined,
    menuRoot: MenuRoot,
    taxSettings: TaxSettings,
    orderType: OrderType = 'delivery'
) => {
    if (!taxSettings || !itemId) {
        return 0;
    }
    let total = 0;
    const item = menuRoot.allItems?.[itemId];
    if (item) {
        const taxCategory = taxSettings.taxCategories?.find((taxCategory) => taxCategory.id === item.taxCatId);
        if (taxCategory) {
            // selected tax category
            total += price * ((taxCategory[`${orderType}Rate`] || 0) / 100);
        } else if (taxSettings.taxCategories?.[0]) {
            // default tax category
            total += price * ((taxSettings.taxCategories[0][`${orderType}Rate`] || 0) / 100);
        }
    }
    return roundTo2Decimals(total);
}

export const calculateCartItemPrice = (cartItem: CartItem, menuRoot: MenuRoot, taxSettings: TaxSettings, orderType: OrderType = 'delivery') => {
    let total = 0;
    if (cartItem.itemId) {
        const item = menuRoot.allItems?.[cartItem.itemId];
        if (item) {
            if (
                orderType === 'pickup' &&
                item.pickupPrc
            ) {
                total += (item.pickupPrc || 0);
            } else {
                total += (item.prc || 0);
            }
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
    total = roundTo2Decimals(total * (cartItem.quantity || 1))
    return {
        itemPrice: total,
        tax: calculateCartItemTax(total, cartItem.itemId, menuRoot, taxSettings, orderType),
    };
}

export const calculateCartTotalPrice = (cart: Cart, menuRoot: MenuRoot, taxSettings: TaxSettings, orderType: OrderType = 'delivery') => {
    if (!cart || !cart.items) {
        return {
            totalPrice: 0,
            tax: 0,
        };
    }
    const total = cart.items?.reduce((total, item) => total +
        calculateCartItemPrice(item, menuRoot, taxSettings, orderType).itemPrice, 0) || 0;
    const tax = cart.items?.reduce((total, item) => total +
        calculateCartItemPrice(item, menuRoot, taxSettings, orderType).tax, 0) || 0;

    return {
        totalPrice: roundTo2Decimals(total),
        tax: roundTo2Decimals(tax),
    };
}