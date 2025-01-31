import { type WeeklyHours } from "./restaurantTypes";

export type ItemId = string | undefined;

//  if undefined or false it will be visible, if true or date timestamp it will be hidden until the date
export type UntilToCheck = boolean | number; // boolean or date timestamp,


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
export const WeeklyScheduleDays = [
    { key: '1' as const, label: 'Monday' },
    { key: '2' as const, label: 'Tuesday' },
    { key: '3' as const, label: 'Wednesday' },
    { key: '4' as const, label: 'Thursday' },
    { key: '5' as const, label: 'Friday' },
    { key: '6' as const, label: 'Saturday' },
    { key: '0' as const, label: 'Sunday' },
];
export const WeeklyScheduleAsString = function (weeklySchedule: dateTimeProp['weeklyScheduleValue']) {
    if (!weeklySchedule) {
        return 'No schedule';
    }
    return WeeklyScheduleDays.filter(function (day) {
        return weeklySchedule[day.key]?.isOpen24 || (weeklySchedule[day.key]?.hours?.length ?? 0) > 0;
    }).map(day => {
        return `${day.label}: ${weeklySchedule[day.key]?.isOpen24 ? '24 hours' : weeklySchedule[day.key]?.hours?.map(hour => `${hour.open?.replace(':00', '')} - ${hour.close?.replace(':00', '')}`).join(', ')}`;
    }).join(" | ");
}

export type OptionGroup = {
    optionGroupId?: string;
    optionGroupLabel?: string;
    maxOptions?: number;
    minOptions?: number;
    type?: "optional" | "mandatory";
    options?: ({
        optionId?: string;
        label?: string;
        price?: number;
        preSelected?: boolean;
        isOutOfStock?: UntilToCheck; // boolean or date timestamp until to be out of stock
        isHidden?: UntilToCheck;
        internalName?: string;
    } | ItemId)[];
}

export type Item = {
    itemId?: ItemId;
    itemLabel?: string;
    description?: string;
    price?: number;
    imageUrl?: string;
    isOutOfStock?: UntilToCheck;
    isHidden?: UntilToCheck;
    isLimitedTime?: dateTimeProp
    isSpecialInstructionsHidden?: boolean;
    internalName?: string;
    taxCategoryId?: string;
    itemLabels?: string[];  // Hot, Vegan, Vegetarian, Gluten-free, Halal, Dairy-free, Raw, Nut-free
    ingredients?: string[]; // to make them removeable from the item
    allergens?: string[]; // Milk, Tree nuts, Eggs, Peanuts, Fish, Wheat, Shellfish, Soybeans
    additives?: string[]; // Artificial colours, Artificial sweeteners, Artificial flavours, Preservatives
    itemSizes?: {
        itemSizeId?: string;
        label?: string;
        price?: number;
        preSelected?: boolean;
        optionGroupIds?: string[];
    }[];
    optionGroupIds?: string[];
};

export type Category = {
    catId?: string;
    categoryLabel?: string;
    isHidden?: UntilToCheck;
    isLimitedTime?: dateTimeProp
    itemIds?: string[];
    optionGroupIds?: string[];
};

export type MenuJSON = {
    categoryIdsOrder?: string[];
    allCategories?: Record<string, Category>;
    allItems?: Record<string, Item>;
    allOptionGroups?: Record<string, OptionGroup>;
}