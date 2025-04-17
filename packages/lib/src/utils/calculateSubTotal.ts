import { calculateCartTotalPrice } from "./calculateCartItemPrice"
import { type Cart } from "../zod/cartItemState"
import { type MenuRoot } from "../zod/menuRootSchema"
import { type TaxSettings } from "../zod/taxSchema"
import { type OrderType } from "../types/orderType"
import { getBestDeliveryZone } from "./getBestDeliveryZone"
import type { Point, DeliveryZone } from "@lib/zod/deliverySchema";
import { calculateFeeTax } from "./calculateFeeTax"
import { roundTo2Decimals } from "./roundTo2Decimals"
import type { CustomServiceFee } from "../zod/serviceFee";
import { exclusiveRate } from "./rateCalc"

type CalculatedCustomServiceFee = {
    name: string,
    tax: number,
    totalWithTax: number,
    itemTotal: number,
};

type SubTotalResult = {
    totalWithTax: number,
    tax: number,
    itemTotal: number,
    calculatedCustomServiceFees: CalculatedCustomServiceFee[]
};

export const calculateSubTotal = (
    currentCart: Cart,
    menuRoot: MenuRoot,
    taxSettings: TaxSettings,
    orderType: OrderType,
    userLocation: Point,
    deliveryZones: DeliveryZone[],
    storeLocation: Point,
    customServiceFees: CustomServiceFee[]
): SubTotalResult => {
    // Calculate cart items total
    const cartTotalValues = calculateCartTotalPrice(currentCart, menuRoot, taxSettings, orderType);

    // Calculate delivery info
    const { deliveryFee, deliveryFeeTax } = getDeliveryInfo(
        orderType,
        userLocation,
        deliveryZones,
        storeLocation,
        taxSettings
    );

    // Initialize result
    const result: SubTotalResult = {
        totalWithTax: 0,
        tax: 0,
        itemTotal: 0,
        calculatedCustomServiceFees: []
    };

    // Calculate totals based on tax settings
    if (!taxSettings) {
        console.error('Invalid tax settings');
        return result;
    }

    if (taxSettings.salesTaxType === 'APPLY_TAX_ON_TOP_OF_PRICES') {
        result.totalWithTax = cartTotalValues.totalPrice + deliveryFee + cartTotalValues.tax + deliveryFeeTax;
    } else {
        result.totalWithTax = cartTotalValues.totalPrice + deliveryFee;
    }

    result.tax = deliveryFeeTax + cartTotalValues.tax;
    result.itemTotal = result.totalWithTax - result.tax;

    // Calculate service fees
    calculateServiceFees(result, customServiceFees, taxSettings);

    // Apply rounding only at the end
    result.totalWithTax = roundTo2Decimals(result.totalWithTax);
    result.tax = roundTo2Decimals(result.tax);
    result.itemTotal = roundTo2Decimals(result.itemTotal);

    result.calculatedCustomServiceFees = result.calculatedCustomServiceFees.map(fee => ({
        ...fee,
        totalWithTax: roundTo2Decimals(fee.totalWithTax),
        itemTotal: roundTo2Decimals(fee.itemTotal),
        tax: roundTo2Decimals(fee.tax),
    }));

    return result;
};

function getDeliveryInfo(
    orderType: OrderType,
    userLocation: Point,
    deliveryZones: DeliveryZone[],
    storeLocation: Point,
    taxSettings: TaxSettings
) {
    let deliveryFee = 0;
    let deliveryFeeTax = 0;

    if (orderType === 'delivery') {
        const bestDeliveryZone = getBestDeliveryZone(
            { lat: userLocation.lat, lng: userLocation.lng },
            deliveryZones,
            { lat: storeLocation.lat, lng: storeLocation.lng }
        );

        deliveryFee = bestDeliveryZone?.totalDeliveryFee ?? 0;
        deliveryFeeTax = calculateFeeTax(
            deliveryFee,
            taxSettings.salesTaxType ?? 'ITEMS_PRICES_ALREADY_INCLUDE_TAXES',
            taxSettings.taxRateForDelivery ?? 0
        );
    }

    return { deliveryFee, deliveryFeeTax };
}

function calculateServiceFees(
    result: SubTotalResult,
    customServiceFees: CustomServiceFee[],
    taxSettings: TaxSettings
) {
    for (const fee of customServiceFees) {
        const feeAmount = exclusiveRate(result.totalWithTax, fee.ratePerOrder ?? 0) +
            (fee.feePerOrder ?? 0);

        const tax = calculateFeeTax(
            feeAmount,
            taxSettings.salesTaxType ?? 'ITEMS_PRICES_ALREADY_INCLUDE_TAXES',
            fee.overrideServiceFeeTaxRate ?? taxSettings.taxRateForServiceFees ?? 0
        );

        const totalWithTax = taxSettings.salesTaxType === 'APPLY_TAX_ON_TOP_OF_PRICES' ?
            feeAmount + tax : feeAmount;

        const itemTotal = taxSettings.salesTaxType === 'APPLY_TAX_ON_TOP_OF_PRICES' ?
            feeAmount : feeAmount - tax;


        result.calculatedCustomServiceFees.push({
            name: fee.name ?? 'Service fee',
            tax: tax,
            totalWithTax,
            itemTotal,
        });
    }

    // Add service fees to totals
    result.totalWithTax += result.calculatedCustomServiceFees.reduce(
        (sum, fee) => sum + fee.totalWithTax, 0
    );

    result.tax += result.calculatedCustomServiceFees.reduce(
        (sum, fee) => sum + fee.tax, 0
    );

    result.itemTotal += result.calculatedCustomServiceFees.reduce(
        (sum, fee) => sum + fee.itemTotal, 0
    );

    // Rounding will be applied at the end of the main function
}