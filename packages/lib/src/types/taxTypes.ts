
export type TaxCategory = {
    id?: string;
    name?: string;
    deliveryRate?: number;
    pickupRate?: number;
}


export type TaxSettings = {
    currency?: string;
    currencySymbol?: string;
    salesTaxType?: 'ITEMS_PRICES_ALREADY_INCLUDE_TAXES' | 'APPLY_TAX_ON_TOP_OF_PRICES';
    taxName?: string;
    taxRateForDelivery?: number;
    taxCategories?: TaxCategory[];
};