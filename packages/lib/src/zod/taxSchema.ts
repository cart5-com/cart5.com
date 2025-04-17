import { z } from 'zod';

export const TAX_TYPE = ["ITEMS_PRICES_ALREADY_INCLUDE_TAXES", "APPLY_TAX_ON_TOP_OF_PRICES"] as const;
export type TaxType = (typeof TAX_TYPE)[number];

export const TaxCategorySchema = z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    deliveryRate: z.number().optional(),
    pickupRate: z.number().optional()
});

export const TaxSettingsSchema = z.object({
    currency: z.string().optional(),
    currencySymbol: z.string().optional(),
    salesTaxType: z.enum(TAX_TYPE).optional(),
    taxName: z.string().optional(),
    showTaxDetailsInCart: z.boolean().optional(),
    taxRateForDelivery: z.number().min(0).max(100).optional(),
    taxRateForServiceFees: z.number().min(0).max(100).optional(),
    taxCategories: z.array(TaxCategorySchema).optional()
});
export type TaxCategory = z.infer<typeof TaxCategorySchema>;
export type TaxSettings = z.infer<typeof TaxSettingsSchema>;