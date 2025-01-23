import type { timeForm } from "lib/types/restaurantTypes";
import type { restaurantScheduledOrdersSettingsTable } from "../restaurant.schema";

export const convertToMinutes = (timeForm: timeForm) => {
    const { timeValue, timeUnit } = timeForm;
    const minutes = timeValue * (timeUnit === 'minutes' ? 1 : timeUnit === 'hours' ? 60 : 1440);
    return minutes;
}

export const calculateScheduledOrdersMinutes = (scheduledOrdersSettings?: Partial<typeof restaurantScheduledOrdersSettingsTable.$inferInsert>) => {
    let pickup_minTimeInAdvance_minutes: number | null = null
    let pickup_maxTimeInAdvance_minutes: number | null = null
    if (scheduledOrdersSettings?.pickup_settings) {
        pickup_minTimeInAdvance_minutes = convertToMinutes(scheduledOrdersSettings?.pickup_settings.min)
        pickup_maxTimeInAdvance_minutes = convertToMinutes(scheduledOrdersSettings?.pickup_settings.max)
    }

    let delivery_minTimeInAdvance_minutes: number | null = null
    let delivery_maxTimeInAdvance_minutes: number | null = null
    if (scheduledOrdersSettings?.delivery_settings) {
        delivery_minTimeInAdvance_minutes = convertToMinutes(scheduledOrdersSettings?.delivery_settings.min)
        delivery_maxTimeInAdvance_minutes = convertToMinutes(scheduledOrdersSettings?.delivery_settings.max)
    }

    return {
        pickup_minTimeInAdvance_minutes,
        pickup_maxTimeInAdvance_minutes,
        delivery_minTimeInAdvance_minutes,
        delivery_maxTimeInAdvance_minutes
    }
}