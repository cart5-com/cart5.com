import { z } from 'zod';

export const OpenHoursSchema = z.object({
    open: z.string().optional(),
    close: z.string().optional()
});

export const HoursDaySchema = z.object({
    isOpen24: z.boolean().optional(),
    hours: z.array(OpenHoursSchema).optional()
});

export const WeeklyScheduleSchema = z.object({
    "0": HoursDaySchema.optional(), // sunday
    "1": HoursDaySchema.optional(), // monday
    "2": HoursDaySchema.optional(), // tuesday
    "3": HoursDaySchema.optional(), // wednesday
    "4": HoursDaySchema.optional(), // thursday
    "5": HoursDaySchema.optional(), // friday
    "6": HoursDaySchema.optional()  // saturday
});

export const WeeklyHoursSchema = z.object({
    isActive: z.boolean().optional(),
    days: WeeklyScheduleSchema.optional()
});

export type OpenHours = z.infer<typeof OpenHoursSchema>;
export type HoursDay = z.infer<typeof HoursDaySchema>;
export type WeeklyHours = z.infer<typeof WeeklyHoursSchema>;
export type WeeklySchedule = z.infer<typeof WeeklyScheduleSchema>;

export type DateRangeValueType2 = {
    start?: number;
    end?: number;
}
export type DateTimeProp2 = undefined | {
    type?: "always" | "weeklySchedule" | "dateRange";
    weeklyScheduleValue?: WeeklySchedule,
    dateRangeValue?: DateRangeValueType2
}

export const DateRangeValueTypeSchema = z.object({
    start: z.number().optional(),
    end: z.number().optional()
});

// if undefined, not enabled
// if type is always, always enabled
// if type is weeklySchedule, weeklyScheduleValue is enabled
// if type is dateRange, dateRangeValue is enabled
export const DateTimePropSchema = z.union([
    z.undefined(),
    z.object({
        type: z.enum(["always", "weeklySchedule", "dateRange"]).optional(),
        weeklyScheduleValue: WeeklyScheduleSchema.optional(),
        dateRangeValue: DateRangeValueTypeSchema.optional()
    })
]);

export type DateRangeValueType = z.infer<typeof DateRangeValueTypeSchema>;
export type DateTimeProp = z.infer<typeof DateTimePropSchema>;