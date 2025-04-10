import { z } from "zod";

export const ServiceFeeSchema = z.object({
    // name: z.string().optional(),
    ratePerOrder: z.number().min(0).optional(),
    feePerOrder: z.number().min(0).optional(),
});

export type ServiceFee = z.infer<typeof ServiceFeeSchema>;