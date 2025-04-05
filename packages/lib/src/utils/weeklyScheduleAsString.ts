import type { WeeklySchedule } from "@lib/zod/weeklyScheduleSchema";

export const WeeklyScheduleDays = [
    { key: '1' as const, label: 'Monday' },
    { key: '2' as const, label: 'Tuesday' },
    { key: '3' as const, label: 'Wednesday' },
    { key: '4' as const, label: 'Thursday' },
    { key: '5' as const, label: 'Friday' },
    { key: '6' as const, label: 'Saturday' },
    { key: '0' as const, label: 'Sunday' },
];

export const WeeklyScheduleAsString = function (weeklySchedule: WeeklySchedule) {
    if (!weeklySchedule) {
        return 'No schedule';
    }
    return WeeklyScheduleDays.filter(function (day) {
        return weeklySchedule[day.key]?.isOpen24 || (weeklySchedule[day.key]?.hours?.length ?? 0) > 0;
    }).map(day => {
        return `${day.label}: ${weeklySchedule[day.key]?.isOpen24 ? '24 hours' : weeklySchedule[day.key]?.hours?.map(hour => `${hour.open?.replace(':00', '')} - ${hour.close?.replace(':00', '')}`).join(', ')}`;
    }).join(" | ");
}