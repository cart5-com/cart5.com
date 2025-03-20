import type { WeeklyHours } from '@lib/types/restaurantTypes'
import type { WeeklySchedule } from '@lib/types/dateTimeType'
import { DateTime } from 'luxon'


export const getBusinessTimeNow = function (
    timezone: string | null,
) {
    if (!timezone) {
        timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    return DateTime.now().setZone(timezone)
}

export const isOpenNow = function (
    timezone: string | null,
    weeklyHours: WeeklyHours
) {
    const businessTimeNow = getBusinessTimeNow(timezone);
    const dayOfWeek = businessTimeNow.weekday.toString();
    // const currentHour = businessTimeNow.toFormat("HH:mm"); // 24 hour format
    // console.log(`current biz time`, currentHour);
    // const currentHour2 = businessTimeNow.toFormat("hh:mm a"); // 12 hour format
    // console.log(`current biz time 2`, currentHour2);
    const workingHours = weeklyHours.days?.[dayOfWeek as keyof WeeklySchedule];
    if (!workingHours) {
        return false;
    }
    if (workingHours.isOpen24) {
        return true;
    }
    for (const period of workingHours.hours || []) {
        const openTime = businessTimeNow.set({
            hour: parseInt(period.open?.split(':')[0] || '0'),
            minute: parseInt(period.open?.split(':')[1] || '0')
        });
        const closeTime = businessTimeNow.set({
            hour: parseInt(period.close?.split(':')[0] || '0'),
            minute: parseInt(period.close?.split(':')[1] || '0')
        });

        // Check if current time is between open and close times
        if (businessTimeNow >= openTime && businessTimeNow <= closeTime) {
            return true;
        }
    }
    return false;
};