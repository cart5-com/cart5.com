import { z } from "zod";
export const printersSchema = z.array(z.object({
    deviceName: z.string(),
    printerName: z.string().optional(),
    printerDescription: z.string().optional(),
    printerOptions: z.object({
        "printer-location": z.string().optional(),
        "printer-make-and-model": z.string().optional(),
        "system_driverinfo": z.string().optional(),
    }),
}));
export type PrintersType = z.infer<typeof printersSchema>;