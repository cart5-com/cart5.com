import type { TimeForm } from "@lib/types/restaurantTypes";
import { restaurantScheduledOrdersSettingsTable } from "@db/schema/restaurant.schema";

const convertToMinutes = (timeForm: TimeForm) => {
    const { timeValue, timeUnit } = timeForm;
    const minutes = (timeValue ?? 0) * (timeUnit === 'minutes' ? 1 : timeUnit === 'hours' ? 60 : 1440);
    return minutes;
}

export const calculateScheduledOrdersMinutes = (
    scheduledOrdersSettings?: Partial<typeof restaurantScheduledOrdersSettingsTable.$inferInsert>
) => {
    let pickup_minTimeInAdvance_minutes: number | null = null
    let pickup_maxTimeInAdvance_minutes: number | null = null
    if (
        scheduledOrdersSettings?.pickup_settings &&
        scheduledOrdersSettings?.pickup_settings.min &&
        scheduledOrdersSettings?.pickup_settings.max
    ) {
        pickup_minTimeInAdvance_minutes = convertToMinutes(scheduledOrdersSettings?.pickup_settings.min)
        pickup_maxTimeInAdvance_minutes = convertToMinutes(scheduledOrdersSettings?.pickup_settings.max)
    }

    let delivery_minTimeInAdvance_minutes: number | null = null
    let delivery_maxTimeInAdvance_minutes: number | null = null
    if (
        scheduledOrdersSettings?.delivery_settings &&
        scheduledOrdersSettings?.delivery_settings.min &&
        scheduledOrdersSettings?.delivery_settings.max
    ) {
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
