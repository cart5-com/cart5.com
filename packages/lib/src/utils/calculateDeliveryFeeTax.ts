import type { TaxSettings } from "@lib/zod/taxSchema";
import { inclusiveRate, exclusiveRate } from "./rateCalc";

export const calculateDeliveryFeeTax = (fee: number, taxSettings: TaxSettings) => {
    if (taxSettings.salesTaxType === 'APPLY_TAX_ON_TOP_OF_PRICES') {
        return exclusiveRate(fee, taxSettings.taxRateForDelivery ?? 0);
    } else {
        return inclusiveRate(fee, taxSettings.taxRateForDelivery ?? 0);
    }

}