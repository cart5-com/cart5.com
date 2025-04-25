import { roundTo2Decimals } from "@lib/utils/roundTo2Decimals";


/**
 * Reverse the fee calculation
 * @param totalBeforeFee - The total before the fee
 * @param ratePerPayment - The rate per payment
 * @param feePerPayment - The fee per payment
 * @returns The fee
 * 
 * For example, if you want to receive $100 after Stripe's 2.9% + $0.30 fee, t
 * his calculation tells you how much to charge the customer so you end up with exactly $100 
 * after Stripe takes their cut.
 */
export const reverseFeeCalculation = (
    totalBeforeFee: number,
    ratePerPayment: number = 2.9,
    feePerPayment: number = 0.30
) => {
    return roundTo2Decimals(
        (
            (
                100 * (totalBeforeFee + feePerPayment)
            )
            /
            (
                100 - ratePerPayment
            )
        ) - totalBeforeFee
    )
}

export const inclusiveRate = (gross: number, rate: number) => {
    return roundTo2Decimals(
        gross - (gross / (1 + (rate / 100)))
        // (gross * rate) / (100 + rate) // This is mathematically correct, but can produce rounding errors for certain combinations of values

    )
}

export const exclusiveRate = (total: number, rate: number) => {
    return roundTo2Decimals(
        total * (
            rate / 100
        )
    )
}
