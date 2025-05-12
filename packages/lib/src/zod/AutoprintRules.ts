import { z } from "zod";

export const AutoprintRuleSchema = z.object({
    id: z.string(),
    isActive: z.boolean(),
    autoprintDeviceId: z.string(),
    printerDeviceName: z.string(),
    copies: z.number(),
    autoAcceptOrderAfterPrint: z.boolean(),
})

export const AutoprintRulesListSchema = z.array(AutoprintRuleSchema)

export type AutoprintRuleType = z.infer<typeof AutoprintRuleSchema>
export type AutoprintRulesListType = z.infer<typeof AutoprintRulesListSchema>


