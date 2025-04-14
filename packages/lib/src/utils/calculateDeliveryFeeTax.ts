import type { TaxSettings } from "@lib/zod/taxSchema";
import { inclusiveRate, exclusiveRate } from "./rateCalc";

export const calculateDeliveryFeeTax = (fee: number, taxSettings: TaxSettings) => {
    if (!taxSettings || !taxSettings.taxRateForDelivery || !taxSettings.salesTaxType) {
        return 0;
    }
    if (taxSettings.salesTaxType === 'APPLY_TAX_ON_TOP_OF_PRICES') {
        return exclusiveRate(fee, taxSettings.taxRateForDelivery ?? 0);
    } else if (taxSettings.salesTaxType === 'ITEMS_PRICES_ALREADY_INCLUDE_TAXES') {
        return inclusiveRate(fee, taxSettings.taxRateForDelivery ?? 0);
    } else {
        console.error('Invalid tax type', taxSettings.salesTaxType);
        return 0;
    }

}