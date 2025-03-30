export type TaxCategory = {
    id?: string;
    name?: string;
    deliveryRate?: number;
    pickupRate?: number;
}

export const getDefaultTaxCategory = (): TaxCategory => {
    return {
        id: crypto.randomUUID().toString(),
        name: 'TAX1',
    }
}

export const defaultTaxSettings: {
    currency?: string;
    salesTaxType?: 'ITEMS_PRICES_ALREADY_INCLUDE_TAXES' | 'APPLY_TAX_ON_TOP_OF_PRICES';
    currencySymbol?: string;
    taxName?: string;
    taxRateForDelivery?: number;
    taxCategories?: TaxCategory[];
} = {
    currency: 'GBP',
    salesTaxType: 'ITEMS_PRICES_ALREADY_INCLUDE_TAXES',
    currencySymbol: '£',
    taxName: 'VAT',
    taxCategories: [
        getDefaultTaxCategory()
    ]
}

