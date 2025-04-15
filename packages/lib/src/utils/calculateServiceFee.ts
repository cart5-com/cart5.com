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
export const calculateServiceFeeWithTax = (
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
        serviceFeeAmountTotal: roundTo2Decimals(serviceFeeAmount),
        serviceFeeAmountWithoutTax: roundTo2Decimals(serviceFeeAmount - tax),
        tax: roundTo2Decimals(tax)
    }
}

export const allowedServiceFeeAmountIfIncluded = (subTotal: number, rate: number, calculationType: "ADD" | "INCLUDE") => {
    if (calculationType === "ADD") {
        return 0
    } else if (calculationType === "INCLUDE") {
        return roundTo2Decimals(exclusiveRate(subTotal, rate))
    } else {
        console.error("Invalid calculation type")
        return 0
    }
}

export const serviceFeeAmountNeedToPayByBuyer = (totalServiceFee: number, allowedServiceFeeAmountIfIncluded: number) => {
    if (totalServiceFee > allowedServiceFeeAmountIfIncluded) {
        return roundTo2Decimals(totalServiceFee - allowedServiceFeeAmountIfIncluded)
    } else {
        return 0
    }
}