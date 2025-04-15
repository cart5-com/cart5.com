import { calculateCartTotalPrice } from "./calculateCartItemPrice"
import { type Cart } from "../zod/cartItemState"
import { type MenuRoot } from "../zod/menuRootSchema"
import { type TaxSettings } from "../zod/taxSchema"
import { type OrderType } from "../types/orderType"
import { getBestDeliveryZone } from "./getBestDeliveryZone"
import type { Point, DeliveryZone } from "@lib/zod/deliverySchema";
import { calculateDeliveryFeeTax } from "./calculateDeliveryFeeTax"
import { roundTo2Decimals } from "./roundTo2Decimals"

export const calculateSubTotal = (
    currentCart: Cart,
    menuRoot: MenuRoot,
    taxSettings: TaxSettings,
    orderType: OrderType,
    userLocation: Point,
    deliveryZones: DeliveryZone[],
    storeLocation: Point
) => {
    const cartTotalValues = calculateCartTotalPrice(currentCart, menuRoot, taxSettings, orderType)
    let bestDeliveryZone = null;
    let deliveryFeeTax = 0;
    if (orderType === 'delivery') {
        bestDeliveryZone = getBestDeliveryZone(
            {
                lat: userLocation.lat,
                lng: userLocation.lng
            },
            deliveryZones,
            {
                lat: storeLocation.lat,
                lng: storeLocation.lng
            }
        )
        deliveryFeeTax = calculateDeliveryFeeTax(bestDeliveryZone?.totalDeliveryFee ?? 0, taxSettings)
    }
    if (!taxSettings) {
        console.error('No tax settings found')
        return {
            totalWithTax: roundTo2Decimals(cartTotalValues.totalPrice + (bestDeliveryZone?.totalDeliveryFee ?? 0)),
            tax: 0
        }
    }

    if (taxSettings.salesTaxType === 'APPLY_TAX_ON_TOP_OF_PRICES') {
        // SUM (ITEMS PRICES + ITEMS TAXES + DELIVERY + DELIVERY TAXES)
        return {
            totalWithTax: roundTo2Decimals(cartTotalValues.totalPrice + (bestDeliveryZone?.totalDeliveryFee ?? 0) +
                cartTotalValues.tax + deliveryFeeTax),
            tax: roundTo2Decimals(deliveryFeeTax + cartTotalValues.tax)
        }
    } else if (taxSettings.salesTaxType === 'ITEMS_PRICES_ALREADY_INCLUDE_TAXES') {
        // SUM (ITEMS PRICES + DELIVERY FEE)
        return {
            totalWithTax: roundTo2Decimals(cartTotalValues.totalPrice + (bestDeliveryZone?.totalDeliveryFee ?? 0)),
            tax: roundTo2Decimals(deliveryFeeTax + cartTotalValues.tax)
        }
    } else {
        console.error('Invalid tax settings')
    }
    return {
        totalWithTax: 0,
        tax: 0
    };
}