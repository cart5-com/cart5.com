import salesTaxRatesJson from 'sales-tax/res/sales_tax_rates.json';
import currencySymbolMap from 'currency-symbol-map';

// override sales tax rates settings to make it clear and easy to use.
// @ts-ignore
salesTaxRatesJson["US"].states["DE"] = {
    "rate": 0.0,
    "type": ""
}
salesTaxRatesJson["TR"].type = "KDV"

export const salesTaxRates: Record<string, {
    type: string;
    currency: string;
    rate: number;
    currencySymbol?: string | undefined;
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

export const getSalesTaxRate = (countryCode: string, regionCode: string) => {
    if (salesTaxRates[countryCode]) {
        if (salesTaxRates[countryCode].states && salesTaxRates[countryCode].states[regionCode]) {
            const countryData = { ...salesTaxRates[countryCode] };
            countryData.currentState = salesTaxRates[countryCode].states[regionCode];
            countryData.currencySymbol = currencySymbolMap(salesTaxRates[countryCode].currency);
            return countryData;
        }
        salesTaxRates[countryCode].currencySymbol = currencySymbolMap(salesTaxRates[countryCode].currency) ?? '';
        return salesTaxRates[countryCode];
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
    const taxRate = (salesTaxRate.rate + (salesTaxRate.currentState?.rate ?? 0)) * 100;
    const taxName = [salesTaxRate.type === 'none' ? '' : salesTaxRate.type.toUpperCase()];
    if (salesTaxRate?.currentState) {
        taxName.push(salesTaxRate?.currentState?.type.toUpperCase());
    }
    return {
        raw: salesTaxRate,
        taxRate,
        taxName: taxName.filter(Boolean).join('-')
    }
}