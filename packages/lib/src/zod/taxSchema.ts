import { z } from 'zod';

export const TaxCategorySchema = z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    deliveryRate: z.number().optional(),
    pickupRate: z.number().optional()
});

export const TaxSettingsSchema = z.object({
    currency: z.string().optional(),
    currencySymbol: z.string().optional(),
    salesTaxType: z.enum(['ITEMS_PRICES_ALREADY_INCLUDE_TAXES', 'APPLY_TAX_ON_TOP_OF_PRICES']).optional(),
    taxName: z.string().optional(),
    taxRateForDelivery: z.number().optional(),
    taxCategories: z.array(TaxCategorySchema).optional()
});
export type TaxCategory = z.infer<typeof TaxCategorySchema>;
export type TaxSettings = z.infer<typeof TaxSettingsSchema>;