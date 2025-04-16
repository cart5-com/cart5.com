import { z } from "zod";

export const ServiceFeeSchema = z.object({
    ratePerOrder: z.number().min(0).optional(),
    feePerOrder: z.number().min(0).optional(),
});
export type ServiceFee = z.infer<typeof ServiceFeeSchema>;

export const CALCULATION_TYPE = ["INCLUDE", "ADD"] as const;
export type CalculationType = (typeof CALCULATION_TYPE)[number];

export const CustomServiceFeeSchema = z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    ratePerOrder: z.number().min(0).optional(),
    feePerOrder: z.number().min(0).optional(),
    overrideServiceFeeTaxRate: z.number().min(0).optional(),
});
export type CustomServiceFee = z.infer<typeof CustomServiceFeeSchema>;