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
        totalWithTax: roundTo2Decimals(serviceFeeAmount),
        itemTotal: roundTo2Decimals(serviceFeeAmount - serviceTax),
        tax: roundTo2Decimals(serviceTax),
        percentage: {
            ratePerOrder: roundTo2Decimals(combinedServiceFee.ratePerOrder ?? 0),
            feePerOrder: roundTo2Decimals(combinedServiceFee.feePerOrder ?? 0)
        }
    };

    // Create breakdown for individual fees
    const feeBreakdown = fees.filter(Boolean).map(fee => {
        if (!fee) return null;

        const feeAmount = exclusiveRate(subTotal.totalWithTax, fee.ratePerOrder ?? 0) +
            (fee.feePerOrder ?? 0);
        const feeTax = inclusiveRate(feeAmount, taxRateForServiceFees);
        const itemTotal = roundTo2Decimals(feeAmount - feeTax);
        const feePercentage = (itemTotal / totalServiceFee.itemTotal) * 100;
        return {
            name: fee.name ?? 'Unnamed Fee',
            totalWithTax: roundTo2Decimals(feeAmount),
            itemTotal: roundTo2Decimals(feeAmount - feeTax),
            tax: roundTo2Decimals(feeTax),
            percentage: roundTo2Decimals(feePercentage)
        };
    }).filter(Boolean);


    // Step 3: Calculate tolerable service fee amount
    const tolerableAmount = config.calculationType === "INCLUDE"
        ? roundTo2Decimals(exclusiveRate(subTotal.totalWithTax, config.tolerableRate))
        : 0;

    // Step 4: Calculate what buyer needs to pay
    let buyerServiceFee = { totalWithTax: 0, itemTotal: 0, tax: 0 };

    if (totalServiceFee.totalWithTax > tolerableAmount) {
        const extraAmount = totalServiceFee.totalWithTax - tolerableAmount;
        const extraTax = inclusiveRate(extraAmount, taxRateForServiceFees);

        buyerServiceFee = {
            totalWithTax: roundTo2Decimals(extraAmount),
            itemTotal: roundTo2Decimals(extraAmount - extraTax),
            tax: roundTo2Decimals(extraTax)
        };
    }

    // Step 5: Calculate discount if applicable
    const discount = config.offerDiscount && tolerableAmount > totalServiceFee.totalWithTax
        ? roundTo2Decimals(tolerableAmount - totalServiceFee.totalWithTax)
        : 0;

    // Step 6: Calculate final amounts
    const totalTax = subTotal.tax + buyerServiceFee.tax;
    let buyerTotal = roundTo2Decimals(subTotal.totalWithTax + buyerServiceFee.totalWithTax - discount);

    // Never apply discount to tax
    if (totalTax > buyerTotal) {
        buyerTotal = roundTo2Decimals(totalTax);
    }

    // Step 7: Calculate what store receives
    const storeReceives = {
        totalWithTax: roundTo2Decimals(buyerTotal - totalServiceFee.totalWithTax),
        tax: roundTo2Decimals(totalTax - totalServiceFee.tax),
        afterTax: roundTo2Decimals(buyerTotal - totalTax)
    };

    // Return complete breakdown
    return {
        tolerableAmount,
        discount,
        buyerPays: {
            totalWithTax: roundTo2Decimals(buyerTotal),
            tax: roundTo2Decimals(totalTax)
        },
        buyerServiceFee,
        storeReceives,
        totalServiceFee,
        feeBreakdown
    };
}