import { calculateCartTotalPrice } from "./calculateCartItemPrice"
import { type Cart } from "../zod/cartItemState"
import { type MenuRoot } from "../zod/menuRootSchema"
import { type TaxSettings } from "../zod/taxSchema"
import { type OrderType } from "../types/orderType"
import { getBestDeliveryZoneWithTaxDetails } from "./getBestDeliveryZone"
import type { Point, DeliveryZone } from "@lib/zod/deliverySchema";
import { calculateFeeTax } from "./calculateFeeTax"
import { roundTo2Decimals } from "./roundTo2Decimals"
import type { CustomServiceFee } from "../zod/serviceFee";
import { exclusiveRate } from "./rateCalc"

type CalculatedCustomServiceFee = {
    name: string,
    itemTotal: number,
    tax: number,
    totalWithTax: number,
    shownFee: number
};

type SubTotalResult = {
    totalWithTax: number,
    tax: number,
    itemTotal: number,
    shownFee: number,
    calculatedCustomServiceFees: CalculatedCustomServiceFee[],
    bestDeliveryZone: ReturnType<typeof getBestDeliveryZoneWithTaxDetails>
};

export const calculateSubTotal = (
    currentCart: Cart | undefined,
    menuRoot: MenuRoot | undefined,
    taxSettings: TaxSettings,
    orderType: OrderType,
    userLocation: Point,
    deliveryZones: DeliveryZone[],
    storeLocation: Point,
    customServiceFees: CustomServiceFee[]
): SubTotalResult => {
    if (!currentCart || !menuRoot) {
        return { totalWithTax: 0, tax: 0, itemTotal: 0, shownFee: 0, calculatedCustomServiceFees: [], bestDeliveryZone: null };
    }
    // Calculate cart items total
    const cartTotalValues = calculateCartTotalPrice(currentCart, menuRoot, taxSettings, orderType);

    // Initialize result
    const result: SubTotalResult = {
        itemTotal: 0,
        tax: 0,
        totalWithTax: 0,
        shownFee: 0,
        calculatedCustomServiceFees: [],
        bestDeliveryZone: null
    };
    // Calculate totals based on tax settings
    if (!taxSettings) {
        console.error('Invalid tax settings');
        return result;
    }

    if (orderType === 'delivery') {
        result.bestDeliveryZone = getBestDeliveryZoneWithTaxDetails(
            { lat: userLocation.lat, lng: userLocation.lng },
            deliveryZones,
            { lat: storeLocation.lat, lng: storeLocation.lng },
            taxSettings
        );
    }

    result.totalWithTax = cartTotalValues.totalWithTax + (result.bestDeliveryZone?.totalWithTax ?? 0);
    result.itemTotal = cartTotalValues.itemTotal + (result.bestDeliveryZone?.itemTotal ?? 0);
    result.tax = cartTotalValues.tax + (result.bestDeliveryZone?.tax ?? 0);

    // Calculate service fees
    calculateServiceFees(result, customServiceFees, taxSettings);

    // Apply rounding only at the end
    result.totalWithTax = roundTo2Decimals(result.totalWithTax);
    result.tax = roundTo2Decimals(result.tax);
    result.itemTotal = roundTo2Decimals(result.itemTotal);

    result.calculatedCustomServiceFees = result.calculatedCustomServiceFees.map(fee => ({
        ...fee,
        itemTotal: roundTo2Decimals(fee.itemTotal),
        tax: roundTo2Decimals(fee.tax),
        totalWithTax: roundTo2Decimals(fee.totalWithTax),
        shownFee: roundTo2Decimals(fee.shownFee)
    }));

    return result;
};


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
            itemTotal,
            tax: tax,
            totalWithTax,
            shownFee: taxSettings.salesTaxType === 'APPLY_TAX_ON_TOP_OF_PRICES' ?
                itemTotal : totalWithTax
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

    result.shownFee += result.calculatedCustomServiceFees.reduce(
        (sum, fee) => sum + fee.shownFee, 0
    );

    // Rounding will be applied at the end of the main function
}