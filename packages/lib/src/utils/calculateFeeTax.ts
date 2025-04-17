import type { TaxType } from "@lib/zod/taxSchema";
import { inclusiveRate, exclusiveRate } from "./rateCalc";

export const calculateFeeTax = (
    fee: number,
    taxType: TaxType,
    taxRate: number
) => {
    if (taxType === 'APPLY_TAX_ON_TOP_OF_PRICES') {
        return exclusiveRate(fee, taxRate);
    } else if (taxType === 'ITEMS_PRICES_ALREADY_INCLUDE_TAXES') {
        return inclusiveRate(fee, taxRate);
    } else {
        console.error('Invalid tax type', taxType);
        return 0;
    }

}