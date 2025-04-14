import type { TaxSettings } from "@lib/zod/taxSchema";
import { roundTo2Decimals } from "@lib/utils/roundTo2Decimals";

export const calculateDeliveryFeeTax = (fee: number, taxSettings: TaxSettings) => {
    return roundTo2Decimals(fee * (taxSettings.taxRateForDelivery ?? 0) / 100);
}