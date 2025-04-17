import { roundTo2Decimals } from "@lib/utils/roundTo2Decimals";

export const calculateStripeFee = (
    totalBeforeStripe: number,
    ratePerPayment: number = 2.9,
    feePerPayment: number = 0.30
) => {
    return roundTo2Decimals(
        (
            (
                100 * (totalBeforeStripe + feePerPayment)
            )
            /
            (
                100 - ratePerPayment
            )
        ) - totalBeforeStripe
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
