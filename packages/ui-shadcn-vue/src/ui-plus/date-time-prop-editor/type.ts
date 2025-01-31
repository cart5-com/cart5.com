
export type OpenHours = {
    open?: string;
    close?: string;
};

export type HoursDay = {
    isOpen24?: boolean;
    hours?: OpenHours[];
};

export type dateTimeProp = {
    type?: "always" | "weeklySchedule" | "dateRange";
    alwaysValue?: boolean;
    weeklyScheduleValue?: {
        "0"?: HoursDay; // sunday
        "1"?: HoursDay; // monday
        "2"?: HoursDay; // tuesday
        "3"?: HoursDay; // wednesday
        "4"?: HoursDay; // thursday
        "5"?: HoursDay; // friday
        "6"?: HoursDay; // saturday
    },
    dateRangeValue?: {
        start?: string;
        end?: string;
    }
}

/*/
help me build date-time-prop-editor component with shadcn-vue.
if reqiuired change typing to make it easy. 
prefer input with types="date"|"time"|"datetime-local"|"number"|"string" etc.. 
do not create or use complex input components.

show radio button group with options: always, weeklySchedule, dateRange
default type: always
if type is always, show a switch to toggle alwaysValue
if type is weeklySchedule, show weekly schedule editor.
if type is dateRange, show date range editor.

/*/