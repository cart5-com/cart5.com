import type { CalculationType, ServiceFee } from "@lib/zod/serviceFee";
import { exclusiveRate, inclusiveRate, reverseFeeCalculation } from "./rateCalc";
import { roundTo2Decimals } from "./roundTo2Decimals";
import type { calculateSubTotal } from "./calculateSubTotal";
import { type TaxSettings } from "../zod/taxSchema"

/**
 * Calculates the complete service fee breakdown for a cart transaction
 * 
 * @param subTotal - Cart subtotal amount (including tax)
 * @param fees - Array of service fees to apply
 * @param taxRateForServiceFees - Tax rate to apply to service fees
 * @param config - Configuration for fee calculation
 * @returns Complete breakdown of all fee calculations
 */
export function calculateCartBreakdown(
    subTotal: ReturnType<typeof calculateSubTotal>,
    // fees: (ServiceFee & { name?: string } | null)[],
    platformServiceFee: ServiceFee | null,
    supportPartnerServiceFee: ServiceFee | null,
    marketingPartnerServiceFee: ServiceFee | null,
    taxRateForServiceFees: number,
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
    const combinedServiceFee: ServiceFee = {
        ratePerOrder: 0,
        feePerOrder: 0
    };

    [platformServiceFee, supportPartnerServiceFee, marketingPartnerServiceFee].forEach(fee => {
        if (fee) {
            combinedServiceFee.ratePerOrder! += fee.ratePerOrder ?? 0;
            combinedServiceFee.feePerOrder! += fee.feePerOrder ?? 0;
        }
    });

    // Step 2: Calculate total service fee amount
    const serviceFeeAmount = exclusiveRate(subTotal.totalWithTax, combinedServiceFee.ratePerOrder ?? 0) +
        (combinedServiceFee.feePerOrder ?? 0);
    const serviceTax = inclusiveRate(serviceFeeAmount, taxRateForServiceFees);

    const totalPlatformFee: {
        totalWithTax: number;
        itemTotal: number;
        tax: number;
        percentage: {
            ratePerOrder: number;
            feePerOrder: number;
        };
        feeBreakdown: {
            [key: string]: {
                name: string;
                note: string;
                totalWithTax: number;
                itemTotal: number;
                tax: number;
            };
        };
    } = {
        totalWithTax: serviceFeeAmount,
        itemTotal: serviceFeeAmount - serviceTax,
        tax: serviceTax,
        percentage: {
            ratePerOrder: combinedServiceFee.ratePerOrder ?? 0,
            feePerOrder: combinedServiceFee.feePerOrder ?? 0
        },
        feeBreakdown: {}
    };
    if (platformServiceFee) {
        const feeAmount = exclusiveRate(subTotal.totalWithTax, platformServiceFee.ratePerOrder ?? 0) +
            (platformServiceFee.feePerOrder ?? 0);
        const feeTax = inclusiveRate(feeAmount, taxRateForServiceFees);
        (totalPlatformFee.feeBreakdown as any).platform = {
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
        const feeTax = inclusiveRate(feeAmount, taxRateForServiceFees);
        (totalPlatformFee.feeBreakdown as any).support = {
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
        const feeTax = inclusiveRate(feeAmount, taxRateForServiceFees);
        (totalPlatformFee.feeBreakdown as any).marketing = {
            name: "Marketing Team",
            note: "helps promoting the store to find new customers",
            totalWithTax: roundTo2Decimals(feeAmount),
            itemTotal: roundTo2Decimals(feeAmount - feeTax),
            tax: roundTo2Decimals(feeTax),
        };
    }

    // breakdown for individual fees
    // const feeBreakdown = [platformServiceFee, supportPartnerServiceFee, marketingPartnerServiceFee].filter(Boolean).map(fee => {
    //     if (!fee) return null;

    //     const feeAmount = exclusiveRate(subTotal.totalWithTax, fee.ratePerOrder ?? 0) +
    //         (fee.feePerOrder ?? 0);
    //     const feeTax = inclusiveRate(feeAmount, taxRateForServiceFees);
    //     // const itemTotal = feeAmount - feeTax;
    //     // const feePercentage = (itemTotal / totalPlatformFee.itemTotal) * 100;
    //     return {
    //         totalWithTax: feeAmount,
    //         itemTotal: feeAmount - feeTax,
    //         tax: feeTax,
    //         // percentage: feePercentage
    //     };
    // });


    // Step 3: Calculate tolerable service fee amount
    const tolerableAmountByStore = config.calculationType === "INCLUDE"
        ? exclusiveRate(subTotal.totalWithTax, config.tolerableRate)
        : 0;
    // console.log('subTotal.totalWithTax🟪🟪', subTotal.totalWithTax)
    // Step 4: Calculate what buyer needs to pay
    let buyerPaysPlatformFee = {
        totalWithTax: 0,
        itemTotal: 0,
        tax: 0,
        shownFee: 0
    };

    if (totalPlatformFee.totalWithTax > tolerableAmountByStore) {
        const extraAmount = totalPlatformFee.totalWithTax - tolerableAmountByStore;
        const extraTax = inclusiveRate(extraAmount, taxRateForServiceFees);
        const shownFee = taxSettings.salesTaxType === 'APPLY_TAX_ON_TOP_OF_PRICES' ? extraAmount - extraTax : extraAmount

        buyerPaysPlatformFee = {
            totalWithTax: extraAmount,
            itemTotal: extraAmount - extraTax,
            tax: extraTax,
            shownFee: shownFee
        };
    }
    // else {
    //     // store covers all platform fees
    // }


    // Step 5: Calculate discount if applicable
    const discount = config.offerDiscount && tolerableAmountByStore > totalPlatformFee.totalWithTax
        ? tolerableAmountByStore - totalPlatformFee.totalWithTax
        : 0;

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
    // Calculate what store receives with detailed breakdown
    const storeReceives = {
        // What buyer pays
        // buyerTotal: roundTo2Decimals(buyerTotal), // includes tax
        tax: roundTo2Decimals(totalTax), // Jurisdiction total
        platformFees: roundTo2Decimals(totalPlatformFee.itemTotal), // includes tax
        // platformFeesBreakdown: {
        //     ...totalPlatformFee.feeBreakdown
        // },
        netRevenue: roundTo2Decimals(
            buyerTotal - totalPlatformFee.itemTotal - totalTax - paymentProcessorFee
        )
    }

    // Return complete breakdown with rounding applied only at the end
    const shownFeeName = taxSettings.salesTaxType === 'APPLY_TAX_ON_TOP_OF_PRICES' ?
        `Taxes${buyerPaysPlatformFee.shownFee > 0 ? ' & Other Fees' : ''}` :
        'Platform Fees';

    const allTransparencyBreakdown: {
        name: string,
        shownFee: string, // currencySymbol+fee
        note: string,
    }[] = [];

    if (totalTax > 0) {
        allTransparencyBreakdown.push({
            name: 'Taxes',
            shownFee: (taxSettings.currencySymbol ?? '') + roundTo2Decimals(totalTax).toString(),
            note: '',
        });
    }
    if (paymentProcessorFee > 0) {
        allTransparencyBreakdown.push({
            name: paymentProcesssorSettings.name,
            shownFee: (taxSettings.currencySymbol ?? '') + roundTo2Decimals(paymentProcessorFee).toString(),
            note: 'The cost of processing online payment',
        });
    }
    Object.entries(totalPlatformFee.feeBreakdown).forEach(([_key, fee]) => {
        allTransparencyBreakdown.push({
            name: fee.name,
            shownFee: (taxSettings.currencySymbol ?? '') + roundTo2Decimals(fee.itemTotal).toString(),
            note: fee.note,
        });
    });
    allTransparencyBreakdown.push({
        name: 'Store',
        shownFee: (taxSettings.currencySymbol ?? '') + roundTo2Decimals(storeReceives.netRevenue).toString(),
        note: 'net amount that store receives after deducting all fees',
    });

    return {
        buyerPays: roundTo2Decimals(buyerTotal),
        allTransparencyBreakdown,

        tolerableAmount: roundTo2Decimals(tolerableAmountByStore),
        discount: roundTo2Decimals(discount),
        taxesAndOtherFees: {
            shownFeeName,
            shownFee: taxSettings.salesTaxType === 'APPLY_TAX_ON_TOP_OF_PRICES' ? roundTo2Decimals(buyerPaysPlatformFee.shownFee + totalTax) : roundTo2Decimals(buyerPaysPlatformFee.shownFee),
            tax: roundTo2Decimals(totalTax),
            otherFees: roundTo2Decimals(buyerPaysPlatformFee.shownFee), // platform fees that needs to cover by buyer
        },
        paymentProcesssorFee: roundTo2Decimals(paymentProcessorFee),
        buyerPaysPlatformFee: { // platform fees that needs to cover by buyer
            totalWithTax: roundTo2Decimals(buyerPaysPlatformFee.totalWithTax),
            itemTotal: roundTo2Decimals(buyerPaysPlatformFee.itemTotal),
            tax: roundTo2Decimals(buyerPaysPlatformFee.tax),
            shownFee: roundTo2Decimals(buyerPaysPlatformFee.shownFee)
        },
        storeReceives,
        totalPlatformFee: { // total platform fees that can be covered by store and buyer
            ...totalPlatformFee,
            totalWithTax: roundTo2Decimals(totalPlatformFee.totalWithTax),
            itemTotal: roundTo2Decimals(totalPlatformFee.itemTotal),
            tax: roundTo2Decimals(totalPlatformFee.tax),
            percentage: {
                ratePerOrder: roundTo2Decimals(totalPlatformFee.percentage.ratePerOrder),
                feePerOrder: roundTo2Decimals(totalPlatformFee.percentage.feePerOrder)
            },
            // feeBreakdown: feeBreakdown.map(fee => {
            //     if (!fee) return null;
            //     return {
            //         name: fee.name,
            //         totalWithTax: roundTo2Decimals(fee.totalWithTax),
            //         itemTotal: roundTo2Decimals(fee.itemTotal),
            //         tax: roundTo2Decimals(fee.tax),
            //         // percentage: roundTo2Decimals(fee.percentage)
            //     };
            // }).filter(Boolean)
        },
    };
}