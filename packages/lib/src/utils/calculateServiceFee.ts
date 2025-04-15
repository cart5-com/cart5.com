import type { ServiceFee } from "@lib/zod/serviceFee";
import { exclusiveRate, inclusiveRate } from "./rateCalc";
import { roundTo2Decimals } from "./roundTo2Decimals";



// const calculationType: "ADD" | "INCLUDE" = "INCLUDE";
// const includedServiceFeeRate = 10;
// const offerDiscountIfPossible = false;
// const platformServiceFee: ServiceFee = {
//     ratePerOrder: 1,
//     feePerOrder: 0,
// };
// const partnerServiceFee: ServiceFee = {
//     ratePerOrder: 2,
//     feePerOrder: 0,
// };
// const marketingPartner: ServiceFee = {
//     ratePerOrder: 3,
//     feePerOrder: 0,
// };
// serviceFee: ServiceFee,
export const calculateAllServiceFees = (
    subTotal: number, // includes tax
    serviceFeeArray: ServiceFee[],
    taxRateForServiceFees: number
) => {
    let serviceFee: ServiceFee = {
        ratePerOrder: 0,
        feePerOrder: 0
    }
    serviceFeeArray.forEach(fee => {
        serviceFee.ratePerOrder! += fee.ratePerOrder ?? 0
        serviceFee.feePerOrder! += fee.feePerOrder ?? 0
    })
    const serviceFeeAmount = exclusiveRate(subTotal, serviceFee.ratePerOrder ?? 0) +
        (serviceFee.feePerOrder ?? 0)
    const tax = inclusiveRate(serviceFeeAmount, taxRateForServiceFees)
    return {
        totalWithTax: roundTo2Decimals(serviceFeeAmount),
        itemTotal: roundTo2Decimals(serviceFeeAmount - tax),
        tax: roundTo2Decimals(tax)
    }
}

export const tolerableServiceFee = (subTotal: number, tolerableServiceFeeRate: number, calculationType: "ADD" | "INCLUDE") => {
    if (calculationType === "ADD") {
        return 0
    } else if (calculationType === "INCLUDE") {
        return roundTo2Decimals(exclusiveRate(subTotal, tolerableServiceFeeRate))
    } else {
        console.error("Invalid calculation type")
        return 0
    }
}

export const serviceFeeAmountNeedToPayByBuyer = (
    totalServiceFee: number,
    allowedServiceFeeAmountIfIncluded: number,
    taxRateForServiceFees: number
) => {
    if (totalServiceFee > allowedServiceFeeAmountIfIncluded) {
        const tax = inclusiveRate(totalServiceFee - allowedServiceFeeAmountIfIncluded, taxRateForServiceFees)
        return {
            totalWithTax: roundTo2Decimals(totalServiceFee - allowedServiceFeeAmountIfIncluded),
            itemTotal: roundTo2Decimals(totalServiceFee - allowedServiceFeeAmountIfIncluded - tax),
            tax: roundTo2Decimals(tax)
        }
    } else {
        return {
            totalWithTax: 0,
            itemTotal: 0,
            tax: 0
        }
    }
}

export const calculateDiscount = (
    offerDiscountIfPossible: boolean,
    tolerableServiceFeeAmount: number,
    totalServiceFee: number,
) => {
    if (offerDiscountIfPossible) {
        const discount = roundTo2Decimals(tolerableServiceFeeAmount - totalServiceFee)
        return discount > 0 ? discount : 0
    } else {
        return 0
    }
}

export const buyerPays = (
    subTotal: {
        total: number,// tax included
        tax: number,
    },
    serviceFeeNeedToPayByBuyer: {
        total: number,// tax included
        tax: number,
    },
    discount: number,
) => {
    const totalTax = subTotal.tax + serviceFeeNeedToPayByBuyer.tax;
    const buyerPaysTotal = roundTo2Decimals(subTotal.total + serviceFeeNeedToPayByBuyer.total - discount)
    if (totalTax > buyerPaysTotal) {
        return {
            tax: totalTax,
            totalWithTax: totalTax
        }
    } else {
        return {
            tax: totalTax,
            totalWithTax: buyerPaysTotal
        }
    }
}


// export const storeReceives = (
//     buyerPays: {
//         totalWithTax: number,// tax included
//         tax: number,
//     },
//     serviceFee: {
// )