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
    config: {
        calculationType: CalculationType,
        tolerableRate: number,
        offerDiscount: boolean
    },
    hasPaymentProcessorFee: boolean,
    paymentProcesssorSettings: {
        name: string,
        ratePerOrder: number,
        feePerOrder: number,
        whoPaysFee: "STORE" | "CUSTOMER"
    }
) {
    // Step 1: Combine all service fees
    const combinedPlatformFee = {
        ratePerOrder: (platformServiceFee?.ratePerOrder ?? 0) +
            (supportPartnerServiceFee?.ratePerOrder ?? 0) +
            (marketingPartnerServiceFee?.ratePerOrder ?? 0),
        feePerOrder: (platformServiceFee?.feePerOrder ?? 0) +
            (supportPartnerServiceFee?.feePerOrder ?? 0) +
            (marketingPartnerServiceFee?.feePerOrder ?? 0)
    };

    // Step 2: Calculate total service fee amount
    const platformFeeAmountIncludingTax = exclusiveRate(subTotal.totalWithTax, combinedPlatformFee.ratePerOrder ?? 0) +
        (combinedPlatformFee.feePerOrder ?? 0);

    const platformFeeTax = inclusiveRate(platformFeeAmountIncludingTax, (taxSettings.taxRateForServiceFees ?? 0));

    const platformFeeWithoutTax = platformFeeAmountIncludingTax - platformFeeTax;

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
            note: "nerds 🤓 who develops and maintains the website",
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



    // Step 3: Calculate tolerable service fee amount
    const tolerableAmountByStore = config.calculationType === "INCLUDE"
        ? exclusiveRate(subTotal.totalWithTax, config.tolerableRate)
        : 0;

    // Step 4: Calculate what buyer needs to pay
    let buyerPaysPlatformFee = {
        totalWithTax: 0,
        itemTotal: 0,
        tax: 0,
        shownFee: 0
    };

    if (platformFeeAmountIncludingTax > tolerableAmountByStore) {
        const extraAmount = platformFeeAmountIncludingTax - tolerableAmountByStore;
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


    // Step 5: Calculate discount if applicable
    let discount = 0;
    if (config.offerDiscount && tolerableAmountByStore > platformFeeAmountIncludingTax) {
        discount = tolerableAmountByStore - platformFeeAmountIncludingTax;
        if (taxSettings.salesTaxType === 'APPLY_TAX_ON_TOP_OF_PRICES') {
            discount = discount - inclusiveRate(discount, (taxSettings.taxRateForServiceFees ?? 0));
        }
    }

    // Step 6: Calculate final amounts
    const totalTax = subTotal.tax + buyerPaysPlatformFee.tax;
    let buyerTotal = subTotal.totalWithTax + buyerPaysPlatformFee.totalWithTax - discount;

    // Never apply discount to tax
    // I believe discount should be simple and stupid, otherwise it will become a three-headed dragon that eats each other
    if (totalTax > buyerTotal) {
        buyerTotal = totalTax;
    }

    // Step 7: Calculate stripe fees    
    let paymentProcessorFee = 0;
    if (hasPaymentProcessorFee) {
        paymentProcessorFee = reverseFeeCalculation(buyerTotal, paymentProcesssorSettings.ratePerOrder, paymentProcesssorSettings.feePerOrder)
        if (paymentProcesssorSettings.whoPaysFee === "CUSTOMER") {
            // no 'store receives' change
            buyerTotal += paymentProcessorFee // payment processor fee has no sales tax
        }
    }

    // Step 8: Calculate what store receives
    const netStoreRevenue = roundTo2Decimals(
        buyerTotal - platformFeeWithoutTax - totalTax - paymentProcessorFee
    );

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
            name: 'Platform Fees',
            currencyShownFee: (taxSettings.currencySymbol ?? '') + roundTo2Decimals(buyerPaysPlatformFee.shownFee),
            note: 'This fee varies based on factors like basket size and helps cover costs related to your order.',
        });
    }

    const buyerPaysTaxAndFeesName = taxSettings.salesTaxType === 'APPLY_TAX_ON_TOP_OF_PRICES' ?
        `Taxes${buyerPaysPlatformFee.shownFee > 0 ? ' & Other Fees' : ''}` :
        'Other Fees';


    return {
        buyerPays: roundTo2Decimals(buyerTotal),
        allTransparencyBreakdown,
        buyerPaysTaxAndFeesName,
        buyerPaysTaxAndFees,
        buyerPaysTaxAndFeesShownFee: roundTo2Decimals(buyerPaysTaxAndFeesShownFee),
        discount: roundTo2Decimals(discount),
        platformFeeBreakdown, // required for saving order data
    };
}