import salesTaxRatesJson from 'sales-tax/res/sales_tax_rates.json';
import currencySymbolMap from 'currency-symbol-map';
import type { TaxSettings } from '@lib/zod/taxSchema';

// override sales tax rates settings to make it clear and easy to use.
// @ts-ignore
// salesTaxRatesJson["US"].states["DE"] = {
//     "rate": 0.0,
//     "type": ""
// }
salesTaxRatesJson["TR"].type = "KDV"

export const salesTaxRates: Record<string, {
    type: string;
    currency: string;
    rate: number;
    currencySymbol?: string | undefined;
    isTaxAppliesAtCheckout?: boolean;
    currentState?: {
        rate: number;
        type: string;
    };
    states?: Record<string, {
        rate: number;
        type: string;
    }>;
    before?: Record<string, {
        type: string;
        currency: string;
        rate: number;
    }>;
}> = salesTaxRatesJson;

const getSalesTaxRate = (countryCode: string, regionCode: string) => {
    if (salesTaxRates[countryCode]) {
        if (salesTaxRates[countryCode].states && salesTaxRates[countryCode].states[regionCode]) {
            const countryData = { ...salesTaxRates[countryCode] };
            countryData.currentState = salesTaxRates[countryCode].states[regionCode];
            countryData.currencySymbol = currencySymbolMap(salesTaxRates[countryCode].currency);
            return countryData;
        }
        return {
            ...salesTaxRates[countryCode],
            currencySymbol: currencySymbolMap(salesTaxRates[countryCode].currency) ?? ''
        };
    }
    // default is "GB"
    return {
        "type": "vat",
        "currency": "GBP",
        "currencySymbol": "£",
        "rate": 0.2
    };
}

export const getJurisdictionSalesTaxRate = (countryCode: string, regionCode: string) => {
    const salesTaxRate = getSalesTaxRate(countryCode, regionCode);
    const taxRate = Number(((salesTaxRate.rate + (salesTaxRate.currentState?.rate ?? 0)) * 100).toFixed(2));
    const taxName = [salesTaxRate.type === 'none' ? '' : salesTaxRate.type.toUpperCase()];
    if (salesTaxRate?.currentState) {
        taxName.push(salesTaxRate?.currentState?.type.toUpperCase());
    }
    salesTaxRate.isTaxAppliesAtCheckout = COUNTRIES_WITH_CHECKOUT_SALES_TAX.includes(countryCode);
    return {
        raw: salesTaxRate,
        taxRate,
        taxName: taxName.filter(Boolean).join('-')
    }
}

/**
 * List of countries where sales tax is calculated at checkout
 */
export const COUNTRIES_WITH_CHECKOUT_SALES_TAX = [
    'US',
    'CA',
    'AU',
    'NZ',
    'IN',
    'SG',
    'AI',
    'MV',
    'PR',
    'JP',
    'MY',
    'BW',
    'KR',
    'PG',
    'TW',
    'JE',
]

export const getAsTaxSettings = (
    countryCode: string, regionCode: string
) => {
    const salesTaxRate = getJurisdictionSalesTaxRate(countryCode, regionCode);
    const taxSettings: TaxSettings = {
        taxCategories: [{
            id: crypto.randomUUID(),
            name: "TAX1",
            deliveryRate: salesTaxRate.taxRate,
            pickupRate: salesTaxRate.taxRate,
        }],
        currency: salesTaxRate.raw.currency,
        currencySymbol: salesTaxRate.raw.currencySymbol ?? undefined,
        salesTaxType: salesTaxRate.raw.isTaxAppliesAtCheckout ? "APPLY_TAX_ON_TOP_OF_PRICES" : "ITEMS_PRICES_ALREADY_INCLUDE_TAXES",
        taxName: salesTaxRate.taxName,
        taxRateForDelivery: salesTaxRate.taxRate,
        taxRateForServiceFees: salesTaxRate.taxRate,
    }
    return taxSettings;
}