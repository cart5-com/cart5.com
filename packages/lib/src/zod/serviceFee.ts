import { z } from "zod";

export const ServiceFeeSchema = z.object({
    // name: z.string().optional(),
    ratePerOrder: z.number().min(0).optional(),
    feePerOrder: z.number().min(0).optional(),
});

export const ALL_SERVICE_FEE_CONDITIONS = ["ALL_ORDERS", "ALL_ONLINE_PAYMENTS", "STRIPE", "DELIVERY", "PICKUP"] as const;

export const CustomServiceFeeByStoreSchema = z.object({
    name: z.string().optional(),
    ratePerOrder: z.number().min(0).optional(),
    feePerOrder: z.number().min(0).optional(),
    condition: z.enum(ALL_SERVICE_FEE_CONDITIONS).optional(),
    taxRate: z.number().min(0).optional(),
});

export type ServiceFee = z.infer<typeof ServiceFeeSchema>;
export type CustomServiceFeeByStore = z.infer<typeof CustomServiceFeeByStoreSchema>;