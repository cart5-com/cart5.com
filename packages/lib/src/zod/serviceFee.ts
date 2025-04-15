import { z } from "zod";

export const ServiceFeeSchema = z.object({
    ratePerOrder: z.number().min(0).optional(),
    feePerOrder: z.number().min(0).optional(),
});
export type ServiceFee = z.infer<typeof ServiceFeeSchema>;

export const CALCULATION_TYPE = ['INCLUDE', 'ADD'] as const;
export const CalculationTypeSchema = z.enum(CALCULATION_TYPE);
export type CalculationType = z.infer<typeof CalculationTypeSchema>;


export const CustomServiceFeeSchema = z.object({
    name: z.string().optional(),
    ratePerOrder: z.number().min(0).optional(),
    feePerOrder: z.number().min(0).optional(),
    overrideServiceFeeTaxRate: z.number().min(0).optional(),
});
export type CustomServiceFee = z.infer<typeof CustomServiceFeeSchema>;