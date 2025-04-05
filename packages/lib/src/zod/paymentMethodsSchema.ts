import { z } from 'zod';


// Payments that happen in-person with physical presence
// cash or (Card+Terminal/Card Reader)
// (at pickup counter) /(at delivery address with delivery person's device or cash)/(at store)
export const CustomPaymentMethodSchema = z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
});

export const PhysicalPaymentMethodsSchema = z.object({
    isActive: z.boolean().optional(), // if not active will use defaultPaymentMethods
    cash: z.boolean().optional(),
    cardTerminal: z.boolean().optional(),
    customMethods: z.array(CustomPaymentMethodSchema).optional(),
});


export type CustomPaymentMethod = z.infer<typeof CustomPaymentMethodSchema>;
export type PhysicalPaymentMethods = z.infer<typeof PhysicalPaymentMethodsSchema>;





