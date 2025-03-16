export type OpenHours = {
    open?: string;
    close?: string;
};

export type HoursDay = {
    isOpen24?: boolean;
    hours?: OpenHours[];
};

export type WeeklySchedule = {
    "0"?: HoursDay; // sunday
    "1"?: HoursDay; // monday
    "2"?: HoursDay; // tuesday
    "3"?: HoursDay; // wednesday
    "4"?: HoursDay; // thursday
    "5"?: HoursDay; // friday
    "6"?: HoursDay; // saturday
}

export type DateRangeValueType = {
    start?: number;
    end?: number;
}

// if undefined, not enabled
// if type is always, always enabled
// if type is weeklySchedule, weeklyScheduleValue is enabled
// if type is dateRange, dateRangeValue is enabled
export type DateTimeProp = undefined | {
    type?: "always" | "weeklySchedule" | "dateRange";
    weeklyScheduleValue?: WeeklySchedule,
    dateRangeValue?: DateRangeValueType
}

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