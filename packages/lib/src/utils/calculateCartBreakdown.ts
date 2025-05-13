import type { CalculationType, ServiceFee } from "@lib/zod/serviceFee";
import { exclusiveRate, inclusiveRate, reverseFeeCalculation } from "./rateCalc";
import type { calculateSubTotal } from "./calculateSubTotal";
import { type TaxSettings } from "../zod/taxSchema"
import { formatCurrency } from "./formatCurrency";

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

            totalWithTax: feeAmount,
            itemTotal: feeAmount - feeTax,
            tax: feeTax,
        };
    }
    if (supportPartnerServiceFee) {
        const feeAmount = exclusiveRate(subTotal.totalWithTax, supportPartnerServiceFee.ratePerOrder ?? 0) +
            (supportPartnerServiceFee.feePerOrder ?? 0);
        const feeTax = inclusiveRate(feeAmount, (taxSettings.taxRateForServiceFees ?? 0));
        platformFeeBreakdown.support = {
            totalWithTax: feeAmount,
            itemTotal: feeAmount - feeTax,
            tax: feeTax,
        };
    }
    if (marketingPartnerServiceFee) {
        const feeAmount = exclusiveRate(subTotal.totalWithTax, marketingPartnerServiceFee.ratePerOrder ?? 0) +
            (marketingPartnerServiceFee.feePerOrder ?? 0);
        const feeTax = inclusiveRate(feeAmount, (taxSettings.taxRateForServiceFees ?? 0));
        platformFeeBreakdown.marketing = {
            totalWithTax: feeAmount,
            itemTotal: feeAmount - feeTax,
            tax: feeTax,
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
        type: keyof typeof feeBreakdownNameMap,
        currencyShownFee: string, // formatted currency fee
        // note: string,
    }[] = [];

    if (totalTax > 0) {
        allTransparencyBreakdown.push({
            type: 'tax',
            currencyShownFee: formatCurrency(totalTax, taxSettings.currency),

        });
    }
    if (paymentProcessorFee > 0) {
        allTransparencyBreakdown.push({
            type: 'paymentProcessorFee',
            currencyShownFee: formatCurrency(paymentProcessorFee, taxSettings.currency),
        });
    }
    Object.entries(platformFeeBreakdown).forEach(([_key, fee]) => {
        allTransparencyBreakdown.push({
            type: _key as 'platform' | 'support' | 'marketing',
            currencyShownFee: formatCurrency(fee.itemTotal, taxSettings.currency),
        });
    });
    const netStoreRevenue = (
        buyerTotal - combinedPlatformFeeWithoutTax - totalTax - paymentProcessorFee
    );
    allTransparencyBreakdown.push({
        type: 'store',
        currencyShownFee: formatCurrency(netStoreRevenue, taxSettings.currency),
    });

    let buyerPaysTaxAndFeesShownFee = taxSettings.salesTaxType === 'APPLY_TAX_ON_TOP_OF_PRICES' ?
        (buyerPaysPlatformFee.shownFee + totalTax) :
        (buyerPaysPlatformFee.shownFee);

    const buyerPaysTaxAndFees: {
        type: keyof typeof feeBreakdownNameMap,
        currencyShownFee: string, // formatted currency fee
    }[] = [];
    if (totalTax > 0 && taxSettings.salesTaxType === 'APPLY_TAX_ON_TOP_OF_PRICES') {
        buyerPaysTaxAndFees.push({
            type: `tax`,
            currencyShownFee: formatCurrency(totalTax, taxSettings.currency),
        });
    }
    if (paymentProcessorFee > 0 && paymentProcesssorSettings.whoPaysFee === "CUSTOMER") {
        buyerPaysTaxAndFeesShownFee += paymentProcessorFee;
        buyerPaysTaxAndFees.push({
            type: `paymentProcessorFee`,
            currencyShownFee: formatCurrency(paymentProcessorFee, taxSettings.currency),
        });
    }
    if (buyerPaysPlatformFee.shownFee > 0) {
        buyerPaysTaxAndFees.push({
            type: `serviceFee`,
            currencyShownFee: formatCurrency(buyerPaysPlatformFee.shownFee, taxSettings.currency),
        });
    }

    const buyerPaysTaxAndFeesName = taxSettings.salesTaxType === 'APPLY_TAX_ON_TOP_OF_PRICES' ?
        `Taxes${(buyerPaysPlatformFee.shownFee > 0 || paymentProcessorFee > 0) ? ' & Other Fees' : ''}` :
        'Other Fees';


    const applicationFeeWithTax = (
        (platformFeeBreakdown.platform?.totalWithTax ?? 0) +
        (platformFeeBreakdown.support?.totalWithTax ?? 0) +
        (platformFeeBreakdown.marketing?.totalWithTax ?? 0)
    );
    const applicationFeeWithoutTax = (
        (platformFeeBreakdown.platform?.itemTotal ?? 0) +
        (platformFeeBreakdown.support?.itemTotal ?? 0) +
        (platformFeeBreakdown.marketing?.itemTotal ?? 0)
    );
    const applicationFeeTax = (
        (platformFeeBreakdown.platform?.tax ?? 0) +
        (platformFeeBreakdown.support?.tax ?? 0) +
        (platformFeeBreakdown.marketing?.tax ?? 0)
    );
    return {
        buyerPays: (buyerTotal),
        tax: (totalTax),
        paymentProcessorFee: (paymentProcessorFee),
        storeRevenue: (netStoreRevenue),

        allTransparencyBreakdown,
        buyerPaysTaxAndFeesName,
        buyerPaysTaxAndFees,
        buyerPaysTaxAndFeesShownFee: (buyerPaysTaxAndFeesShownFee),
        discount: (discount),
        platformFeeBreakdown, // we need this for saving order data
        applicationFeeWithTax: (applicationFeeWithTax),
        applicationFeeWithoutTax: (applicationFeeWithoutTax),
        applicationFeeTax: (applicationFeeTax),
    };
}

// // type: 'tax' | 'paymentProcessorFee' | 'platform' | 'support' | 'marketing' | 'store',
export const feeBreakdownNameMap = {
    tax: {
        name: 'Tax',
        note: '',
    },
    paymentProcessorFee: {
        name: 'Online payment fee',
        note: 'The cost of processing online payments',
    },
    platform: {
        name: 'Platform Team',
        note: 'tech team that builds and maintains this website',
    },
    support: {
        name: 'Support Team',
        note: 'provides dedicated support and guidance to stores',
    },
    marketing: {
        name: 'Marketing Team',
        note: 'helps promoting the store to find new customers',
    },
    store: {
        name: 'Store',
        note: 'net amount that store receives after deducting all fees',
    },
    serviceFee: {
        name: 'Service Fee',
        note: 'This fee varies based on factors like basket size and helps cover costs related to your order.',
    }
};

