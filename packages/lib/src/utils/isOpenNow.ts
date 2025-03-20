import type { WeeklySchedule, OpenHours, WeeklyHours } from '@lib/types/dateTimeType'
import { DateTime } from 'luxon'

export const getCurrentTimeNow = function (
    timezone: string | null,
) {
    if (!timezone) {
        timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    return DateTime.now().setZone(timezone)
}


export const isOpenNow = function (
    timezone: string | null,
    weeklyHours: WeeklyHours | null,
) {
    if (!weeklyHours) {
        return false;
    }
    const businessTimeNow = getCurrentTimeNow(timezone);
    const dayOfWeek = businessTimeNow.weekday.toString();

    // Check current day's hours
    const workingHours = weeklyHours.days?.[dayOfWeek as keyof WeeklySchedule];
    if (!workingHours) {
        return false;
    }
    if (workingHours.isOpen24) {
        return true;
    }

    // Check if open during current day's hours
    if (isOpenDuringPeriods(businessTimeNow, workingHours.hours || [])) {
        return true;
    }

    // Check if we're in an overnight period from the previous day
    const yesterdayDayOfWeek = businessTimeNow.minus({ days: 1 }).weekday.toString();
    const yesterdayWorkingHours = weeklyHours.days?.[yesterdayDayOfWeek as keyof WeeklySchedule];

    if (yesterdayWorkingHours?.hours) {
        // Check only overnight periods from previous day
        const overnightPeriods = (yesterdayWorkingHours.hours || []).filter(period => {
            if (!period.open || !period.close) return false;

            const openHour = parseInt(period.open.split(':')[0] || '0');
            const closeHour = parseInt(period.close.split(':')[0] || '0');
            const openMinute = parseInt(period.open.split(':')[1] || '0');
            const closeMinute = parseInt(period.close.split(':')[1] || '0');

            // Check if period spans overnight
            return (closeHour < openHour) || (closeHour === openHour && closeMinute < openMinute);
        });

        // If we have overnight periods, check if current time is before their closing time
        if (overnightPeriods.length > 0) {
            for (const period of overnightPeriods) {
                const closeTime = businessTimeNow.set({
                    hour: parseInt(period.close?.split(':')[0] || '0'),
                    minute: parseInt(period.close?.split(':')[1] || '0')
                });

                if (businessTimeNow <= closeTime) {
                    return true;
                }
            }
        }
    }

    return false;
};

// Helper function to check if business is open during any of the given periods
function isOpenDuringPeriods(currentTime: DateTime, periods: OpenHours[]): boolean {
    for (const period of periods) {
        if (!period.open || !period.close) continue;

        const openHour = parseInt(period.open.split(':')[0] || '0');
        const closeHour = parseInt(period.close.split(':')[0] || '0');
        const openMinute = parseInt(period.open.split(':')[1] || '0');
        const closeMinute = parseInt(period.close.split(':')[1] || '0');

        const openTime = currentTime.set({
            hour: openHour,
            minute: openMinute
        });

        const closeTime = currentTime.set({
            hour: closeHour,
            minute: closeMinute
        });

        // Check if period spans overnight
        const isOvernight = (closeHour < openHour) ||
            (closeHour === openHour && closeMinute < openMinute);

        if (isOvernight) {
            // For overnight periods, check if current time is after opening time
            if (currentTime >= openTime) {
                return true;
            }
        } else {
            // For regular periods, check if current time is between opening and closing
            if (currentTime >= openTime && currentTime <= closeTime) {
                return true;
            }
        }
    }

    return false;
}