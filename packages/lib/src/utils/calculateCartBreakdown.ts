import type { CalculationType, ServiceFee } from "@lib/zod/serviceFee";
import { exclusiveRate, inclusiveRate } from "./rateCalc";
import { roundTo2Decimals } from "./roundTo2Decimals";
import type { calculateSubTotal } from "./calculateSubTotal";
// import { calculateStripeFee } from "@lib/utils/rateCalc";

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
    fees: (ServiceFee & { name?: string } | null)[],
    taxRateForServiceFees: number,
    config: {
        calculationType: CalculationType,
        tolerableRate: number,
        offerDiscount: boolean
    }
) {
    // Step 1: Combine all service fees
    const combinedServiceFee: ServiceFee = {
        ratePerOrder: 0,
        feePerOrder: 0
    };

    fees.forEach(fee => {
        if (fee) {
            combinedServiceFee.ratePerOrder! += fee.ratePerOrder ?? 0;
            combinedServiceFee.feePerOrder! += fee.feePerOrder ?? 0;
        }
    });

    // Step 2: Calculate total service fee amount
    const serviceFeeAmount = exclusiveRate(subTotal.totalWithTax, combinedServiceFee.ratePerOrder ?? 0) +
        (combinedServiceFee.feePerOrder ?? 0);
    const serviceTax = inclusiveRate(serviceFeeAmount, taxRateForServiceFees);

    const totalServiceFee = {
        totalWithTax: serviceFeeAmount,
        itemTotal: serviceFeeAmount - serviceTax,
        tax: serviceTax,
        percentage: {
            ratePerOrder: combinedServiceFee.ratePerOrder ?? 0,
            feePerOrder: combinedServiceFee.feePerOrder ?? 0
        }
    };

    // Create breakdown for individual fees
    const feeBreakdown = fees.filter(Boolean).map(fee => {
        if (!fee) return null;

        const feeAmount = exclusiveRate(subTotal.totalWithTax, fee.ratePerOrder ?? 0) +
            (fee.feePerOrder ?? 0);
        const feeTax = inclusiveRate(feeAmount, taxRateForServiceFees);
        const itemTotal = feeAmount - feeTax;
        const feePercentage = (itemTotal / totalServiceFee.itemTotal) * 100;
        return {
            name: fee.name ?? 'Unnamed Fee',
            totalWithTax: feeAmount,
            itemTotal: feeAmount - feeTax,
            tax: feeTax,
            percentage: feePercentage
        };
    }).filter(Boolean);


    // Step 3: Calculate tolerable service fee amount
    const tolerableAmount = config.calculationType === "INCLUDE"
        ? exclusiveRate(subTotal.totalWithTax, config.tolerableRate)
        : 0;

    // Step 4: Calculate what buyer needs to pay
    let buyerServiceFee = { totalWithTax: 0, itemTotal: 0, tax: 0 };

    if (totalServiceFee.totalWithTax > tolerableAmount) {
        const extraAmount = totalServiceFee.totalWithTax - tolerableAmount;
        const extraTax = inclusiveRate(extraAmount, taxRateForServiceFees);

        buyerServiceFee = {
            totalWithTax: extraAmount,
            itemTotal: extraAmount - extraTax,
            tax: extraTax
        };
    }

    // Step 5: Calculate discount if applicable
    const discount = config.offerDiscount && tolerableAmount > totalServiceFee.totalWithTax
        ? tolerableAmount - totalServiceFee.totalWithTax
        : 0;

    // Step 6: Calculate final amounts
    const totalTax = subTotal.tax + buyerServiceFee.tax;
    let buyerTotal = subTotal.totalWithTax + buyerServiceFee.totalWithTax - discount;

    // Never apply discount to tax
    if (totalTax > buyerTotal) {
        buyerTotal = totalTax;
    }

    // Step 7: Calculate what store receives
    const storeReceives = {
        totalWithTax: buyerTotal - totalServiceFee.totalWithTax,
        tax: totalTax - totalServiceFee.tax,
        afterTax: buyerTotal - totalTax
    };

    // Return complete breakdown with rounding applied only at the end
    return {
        tolerableAmount: roundTo2Decimals(tolerableAmount),
        discount: roundTo2Decimals(discount),
        buyerPays: {
            totalWithTax: roundTo2Decimals(buyerTotal),
            tax: roundTo2Decimals(totalTax)
        },
        buyerServiceFee: {
            totalWithTax: roundTo2Decimals(buyerServiceFee.totalWithTax),
            itemTotal: roundTo2Decimals(buyerServiceFee.itemTotal),
            tax: roundTo2Decimals(buyerServiceFee.tax)
        },
        storeReceives: {
            totalWithTax: roundTo2Decimals(storeReceives.totalWithTax),
            tax: roundTo2Decimals(storeReceives.tax),
            afterTax: roundTo2Decimals(storeReceives.afterTax)
        },
        totalServiceFee: {
            totalWithTax: roundTo2Decimals(totalServiceFee.totalWithTax),
            itemTotal: roundTo2Decimals(totalServiceFee.itemTotal),
            tax: roundTo2Decimals(totalServiceFee.tax),
            percentage: {
                ratePerOrder: roundTo2Decimals(totalServiceFee.percentage.ratePerOrder),
                feePerOrder: roundTo2Decimals(totalServiceFee.percentage.feePerOrder)
            }
        },
        feeBreakdown: feeBreakdown.map(fee => {
            if (!fee) return null;
            return {
                name: fee.name,
                totalWithTax: roundTo2Decimals(fee.totalWithTax),
                itemTotal: roundTo2Decimals(fee.itemTotal),
                tax: roundTo2Decimals(fee.tax),
                percentage: roundTo2Decimals(fee.percentage)
            };
        }).filter(Boolean)
    };
}