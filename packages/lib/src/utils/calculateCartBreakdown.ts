import type { CalculationType, ServiceFee } from "@lib/zod/serviceFee";
import { exclusiveRate, inclusiveRate, reverseFeeCalculation } from "./rateCalc";
import { roundTo2Decimals } from "./roundTo2Decimals";
import type { calculateSubTotal } from "./calculateSubTotal";
import { type TaxSettings } from "../zod/taxSchema"


export function calculateCartBreakdown(
    subTotal: ReturnType<typeof calculateSubTotal>,
    platformServiceFee: ServiceFee | null,
    supportPartnerServiceFee: ServiceFee | null,
    marketingPartnerServiceFee: ServiceFee | null,
    taxSettings: TaxSettings,
    tolerableFeeByStoreCalculationType: CalculationType,
    tolerableRateByStoreToCoverServiceFees: number,
    isOfferDiscountEnabled: boolean,
    hasPaymentProcessorFee: boolean,
    paymentProcesssorSettings: {
        name: string,
        ratePerOrder: number,
        feePerOrder: number,
        whoPaysFee: "STORE" | "CUSTOMER"
    }
) {
    const combinedPlatformFee = {
        ratePerOrder: (platformServiceFee?.ratePerOrder ?? 0) +
            (supportPartnerServiceFee?.ratePerOrder ?? 0) +
            (marketingPartnerServiceFee?.ratePerOrder ?? 0),
        feePerOrder: (platformServiceFee?.feePerOrder ?? 0) +
            (supportPartnerServiceFee?.feePerOrder ?? 0) +
            (marketingPartnerServiceFee?.feePerOrder ?? 0)
    };

    const combinedPlatformFeeAmountIncludingTax = exclusiveRate(subTotal.totalWithTax, combinedPlatformFee.ratePerOrder ?? 0) +
        (combinedPlatformFee.feePerOrder ?? 0);

    const combinedPlatformFeeTaxonly = inclusiveRate(combinedPlatformFeeAmountIncludingTax, (taxSettings.taxRateForServiceFees ?? 0));

    const combinedPlatformFeeWithoutTax = combinedPlatformFeeAmountIncludingTax - combinedPlatformFeeTaxonly;

    type PlatformFeeBreakdown = {
        name: string;
        note: string;
        totalWithTax: number; // always include tax
        itemTotal: number; // always exclude tax
        tax: number; // the tax
    }
    const platformFeeBreakdown: Partial<Record<"platform" | "support" | "marketing", PlatformFeeBreakdown>> = {};

    if (platformServiceFee) {
        const feeAmount = exclusiveRate(subTotal.totalWithTax, platformServiceFee.ratePerOrder ?? 0) +
            (platformServiceFee.feePerOrder ?? 0);
        const feeTax = inclusiveRate(feeAmount, (taxSettings.taxRateForServiceFees ?? 0));
        platformFeeBreakdown.platform = {
            name: "Platform Team",
            note: "tech team that builds and maintains this website",
            totalWithTax: roundTo2Decimals(feeAmount),
            itemTotal: roundTo2Decimals(feeAmount - feeTax),
            tax: roundTo2Decimals(feeTax),
        };
    }
    if (supportPartnerServiceFee) {
        const feeAmount = exclusiveRate(subTotal.totalWithTax, supportPartnerServiceFee.ratePerOrder ?? 0) +
            (supportPartnerServiceFee.feePerOrder ?? 0);
        const feeTax = inclusiveRate(feeAmount, (taxSettings.taxRateForServiceFees ?? 0));
        platformFeeBreakdown.support = {
            name: "Support Team",
            note: "provides dedicated support and guidance to stores",
            totalWithTax: roundTo2Decimals(feeAmount),
            itemTotal: roundTo2Decimals(feeAmount - feeTax),
            tax: roundTo2Decimals(feeTax),
        };
    }
    if (marketingPartnerServiceFee) {
        const feeAmount = exclusiveRate(subTotal.totalWithTax, marketingPartnerServiceFee.ratePerOrder ?? 0) +
            (marketingPartnerServiceFee.feePerOrder ?? 0);
        const feeTax = inclusiveRate(feeAmount, (taxSettings.taxRateForServiceFees ?? 0));
        platformFeeBreakdown.marketing = {
            name: "Marketing Team",
            note: "helps promoting the store to find new customers",
            totalWithTax: roundTo2Decimals(feeAmount),
            itemTotal: roundTo2Decimals(feeAmount - feeTax),
            tax: roundTo2Decimals(feeTax),
        };
    }



    const tolerableAmountByStore = tolerableFeeByStoreCalculationType === "INCLUDE"
        ? exclusiveRate(subTotal.totalWithTax, tolerableRateByStoreToCoverServiceFees)
        : 0;

    let buyerPaysPlatformFee = {
        totalWithTax: 0,
        itemTotal: 0,
        tax: 0,
        shownFee: 0
    };

    if (combinedPlatformFeeAmountIncludingTax > tolerableAmountByStore) {
        const extraAmount = combinedPlatformFeeAmountIncludingTax - tolerableAmountByStore;
        const extraTax = inclusiveRate(extraAmount, (taxSettings.taxRateForServiceFees ?? 0));
        const shownFee = taxSettings.salesTaxType === 'APPLY_TAX_ON_TOP_OF_PRICES' ?
            extraAmount - extraTax :
            extraAmount

        buyerPaysPlatformFee = {
            totalWithTax: extraAmount,
            itemTotal: extraAmount - extraTax,
            tax: extraTax,
            shownFee: shownFee
        };
    }


    let discount = 0;
    if (isOfferDiscountEnabled && tolerableAmountByStore > combinedPlatformFeeAmountIncludingTax) {
        discount = tolerableAmountByStore - combinedPlatformFeeAmountIncludingTax;
        // if (taxSettings.salesTaxType === 'APPLY_TAX_ON_TOP_OF_PRICES') {
        discount = discount - inclusiveRate(discount, (taxSettings.taxRateForServiceFees ?? 0));
        // }
    }

    const totalTax = subTotal.tax + buyerPaysPlatformFee.tax;
    let buyerTotal = subTotal.totalWithTax + buyerPaysPlatformFee.totalWithTax - discount;

    // Never apply discount to tax
    // I think, discount should be simple and stupid. 
    // I can not deal with the logic of applying discount to tax or individual fees in the cart
    // it is too complex for my stupid brain to handle
    if (totalTax > buyerTotal) {
        buyerTotal = totalTax;
    }

    let paymentProcessorFee = 0;
    if (hasPaymentProcessorFee) {
        paymentProcessorFee = reverseFeeCalculation(buyerTotal, paymentProcesssorSettings.ratePerOrder, paymentProcesssorSettings.feePerOrder)
        if (paymentProcesssorSettings.whoPaysFee === "CUSTOMER") {
            buyerTotal += paymentProcessorFee // payment processor fee has no sales tax
        }
    }

    const allTransparencyBreakdown: {
        name: string,
        currencyShownFee: string, // currencySymbol+fee
        note: string,
    }[] = [];

    if (totalTax > 0) {
        allTransparencyBreakdown.push({
            name: 'Taxes',
            currencyShownFee: (taxSettings.currencySymbol ?? '') + roundTo2Decimals(totalTax),
            note: '',
        });
    }
    if (paymentProcessorFee > 0) {
        allTransparencyBreakdown.push({
            name: paymentProcesssorSettings.name,
            currencyShownFee: (taxSettings.currencySymbol ?? '') + roundTo2Decimals(paymentProcessorFee),
            note: 'The cost of processing online payment',
        });
    }
    Object.entries(platformFeeBreakdown).forEach(([_key, fee]) => {
        allTransparencyBreakdown.push({
            name: fee.name,
            currencyShownFee: (taxSettings.currencySymbol ?? '') + roundTo2Decimals(fee.itemTotal),
            note: fee.note,
        });
    });
    const netStoreRevenue = roundTo2Decimals(
        buyerTotal - combinedPlatformFeeWithoutTax - totalTax - paymentProcessorFee
    );
    allTransparencyBreakdown.push({
        name: 'Store',
        currencyShownFee: (taxSettings.currencySymbol ?? '') + roundTo2Decimals(netStoreRevenue),
        note: 'net amount that store receives after deducting all fees',
    });

    let buyerPaysTaxAndFeesShownFee = taxSettings.salesTaxType === 'APPLY_TAX_ON_TOP_OF_PRICES' ?
        (buyerPaysPlatformFee.shownFee + totalTax) :
        (buyerPaysPlatformFee.shownFee);
    const buyerPaysTaxAndFees: {
        name: string,
        currencyShownFee: string, // currencySymbol+fee
        note: string,
    }[] = [];
    if (totalTax > 0 && taxSettings.salesTaxType === 'APPLY_TAX_ON_TOP_OF_PRICES') {
        buyerPaysTaxAndFees.push({
            name: `Taxes`,
            currencyShownFee: (taxSettings.currencySymbol ?? '') + roundTo2Decimals(totalTax),
            note: '',
        });
    }
    if (paymentProcessorFee > 0 && paymentProcesssorSettings.whoPaysFee === "CUSTOMER") {
        buyerPaysTaxAndFeesShownFee += paymentProcessorFee;
        buyerPaysTaxAndFees.push({
            name: paymentProcesssorSettings.name,
            currencyShownFee: (taxSettings.currencySymbol ?? '') + roundTo2Decimals(paymentProcessorFee),
            note: 'online payment processing fee',
        });
    }
    if (buyerPaysPlatformFee.shownFee > 0) {
        buyerPaysTaxAndFees.push({
            name: 'Service Fee',
            currencyShownFee: (taxSettings.currencySymbol ?? '') + roundTo2Decimals(buyerPaysPlatformFee.shownFee),
            note: 'This fee varies based on factors like basket size and helps cover costs related to your order.',
        });
    }

    const buyerPaysTaxAndFeesName = taxSettings.salesTaxType === 'APPLY_TAX_ON_TOP_OF_PRICES' ?
        `Taxes${(buyerPaysPlatformFee.shownFee > 0 || paymentProcessorFee > 0) ? ' & Other Fees' : ''}` :
        'Other Fees';


    return {
        buyerPays: roundTo2Decimals(buyerTotal),
        allTransparencyBreakdown,
        buyerPaysTaxAndFeesName,
        buyerPaysTaxAndFees,
        buyerPaysTaxAndFeesShownFee: roundTo2Decimals(buyerPaysTaxAndFeesShownFee),
        discount: roundTo2Decimals(discount),
        platformFeeBreakdown, // we need this for saving order data
    };
}