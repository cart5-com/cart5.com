import type { ItemId, MenuRoot } from "@lib/zod/menuRootSchema";
import type { CartChildrenItemState, CartItem, Cart } from "@lib/zod/cartItemState";
import type { OrderType } from "@lib/types/orderType";
import type { TaxSettings } from "@lib/zod/taxSchema";
import { roundTo2Decimals } from "@lib/utils/roundTo2Decimals";
import { inclusiveRate, exclusiveRate } from "./rateCalc";

export const recursiveCartChildrenItemState = (customizationState: CartChildrenItemState, menuRoot: MenuRoot) => {
    let total = 0;
    if (customizationState.itemId) {
        // const customizationItem = menuRoot.allItems?.[customizationState.itemId];
        // let countQuantity = 0;
        // if (customizationItem?.maxQ) {
        //     // console.log('customizationItem?.maxQ', customizationItem?.maxQ);
        // }
        if (customizationState.childrenState) {
            for (const optionIndex in customizationState.childrenState) {
                const optionItem = menuRoot.allItems?.[customizationState.childrenState[optionIndex]?.itemId!];
                if (customizationState.childrenState[optionIndex]?.itemId) {
                    const quantity = customizationState.childrenState[optionIndex]?.quantity || 0;

                    // countQuantity += quantity;
                    // if (countQuantity > customizationItem?.maxQ!) {
                    //     // console.log('countQuantity > customizationItem?.maxQ', countQuantity, customizationItem?.maxQ);
                    // }

                    // if (optionItem?.maxQ && quantity > optionItem?.maxQ) {
                    //     quantity = optionItem?.maxQ;
                    // }
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

const calculateCartItemTax = (
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
            if (taxSettings.salesTaxType === 'APPLY_TAX_ON_TOP_OF_PRICES') {
                if (orderType === 'delivery') {
                    total += exclusiveRate(price, taxCategory[`deliveryRate`] || 0);
                } else if (orderType === 'pickup') {
                    total += exclusiveRate(price, taxCategory[`pickupRate`] || 0);
                }
            } else if (taxSettings.salesTaxType === 'ITEMS_PRICES_ALREADY_INCLUDE_TAXES') {
                if (orderType === 'delivery') {
                    total += inclusiveRate(price, taxCategory[`deliveryRate`] || 0);
                } else if (orderType === 'pickup') {
                    total += inclusiveRate(price, taxCategory[`pickupRate`] || 0);
                }
            } else {
                console.error('Invalid tax type', taxSettings.salesTaxType);
            }
        } else if (taxSettings.taxCategories?.[0]) {
            // default tax category
            if (taxSettings.salesTaxType === 'APPLY_TAX_ON_TOP_OF_PRICES') {
                if (orderType === 'delivery') {
                    total += exclusiveRate(price, taxSettings.taxCategories[0][`deliveryRate`] || 0);
                } else if (orderType === 'pickup') {
                    total += exclusiveRate(price, taxSettings.taxCategories[0][`pickupRate`] || 0);
                }
            } else if (taxSettings.salesTaxType === 'ITEMS_PRICES_ALREADY_INCLUDE_TAXES') {
                if (orderType === 'delivery') {
                    total += inclusiveRate(price, taxSettings.taxCategories[0][`deliveryRate`] || 0);
                } else if (orderType === 'pickup') {
                    total += inclusiveRate(price, taxSettings.taxCategories[0][`pickupRate`] || 0);
                }
            } else {
                console.error('Invalid tax type', taxSettings.salesTaxType);
            }
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
    total = total * (cartItem.quantity || 1)

    const tax = calculateCartItemTax(total, cartItem.itemId, menuRoot, taxSettings, orderType);
    const totalWithTax = taxSettings.salesTaxType === 'APPLY_TAX_ON_TOP_OF_PRICES' ? total + tax : total;
    const shownFee = taxSettings.salesTaxType === 'APPLY_TAX_ON_TOP_OF_PRICES' ? total : totalWithTax;
    const itemTotal = taxSettings.salesTaxType === 'APPLY_TAX_ON_TOP_OF_PRICES' ? total : total - tax;
    return {
        itemTotal: roundTo2Decimals(itemTotal),
        tax: roundTo2Decimals(tax),
        totalWithTax: roundTo2Decimals(totalWithTax),
        shownFee: roundTo2Decimals(shownFee),
    };
}

export const calculateCartTotalPrice = (cart: Cart | undefined, menuRoot: MenuRoot | undefined, taxSettings: TaxSettings | undefined, orderType: OrderType = 'delivery') => {
    let result = {
        itemTotal: 0,
        tax: 0,
        totalWithTax: 0,
        shownFee: 0,
    };
    if (!cart || !cart.items || !menuRoot || !taxSettings) {
        return result;
    }

    cart.items.forEach(item => {
        const itemPrice = calculateCartItemPrice(item, menuRoot, taxSettings, orderType);
        result.itemTotal += itemPrice.itemTotal || 0;
        result.tax += itemPrice.tax || 0;
        result.totalWithTax += itemPrice.totalWithTax || 0;
        result.shownFee += itemPrice.shownFee || 0;
    })

    return {
        itemTotal: roundTo2Decimals(result.itemTotal),
        tax: roundTo2Decimals(result.tax),
        totalWithTax: roundTo2Decimals(result.totalWithTax),
        shownFee: roundTo2Decimals(result.shownFee),
    };
}