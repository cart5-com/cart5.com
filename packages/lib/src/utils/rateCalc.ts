import { roundTo2Decimals } from "@lib/utils/roundTo2Decimals";

export const stripeRate = (total: number, ratePerPayment: number, feePerPayment: number) => {
    return roundTo2Decimals(
        (
            (
                100 * (total + feePerPayment)
            )
            /
            (
                100 - ratePerPayment
            )
        ) - total
    )
}

export const inclusiveRate = (gross: number, rate: number) => {
    return roundTo2Decimals(
        // gross - (gross / (1 + (rate / 100)))
        (gross * rate) / (100 + rate)
    )
}

export const exclusiveRate = (total: number, rate: number) => {
    return roundTo2Decimals(
        total * (
            rate / 100
        )
    )
}
