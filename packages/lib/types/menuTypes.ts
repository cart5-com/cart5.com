// import { type WeeklyHours } from "./restaurantTypes";
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

export const sampleMenuJSON: MenuJSON = {
    categoryIdsOrder: [
        "cat-1",
        "cat-2",
        "cat-3",
    ],
    allCategories: {
        "cat-1": {
            catId: "cat-1",
            categoryLabel: "Burgers",
            itemIds: [
                "item-1",
                "item-2",
                "item-3",
            ],
            isLimitedTime: {
                type: "always",
                alwaysValue: false,
            },
        },
        "cat-2": {
            catId: "cat-2",
            categoryLabel: "Pizzas",
            itemIds: [],
        },
        "cat-3": {
            catId: "cat-3",
            categoryLabel: "Drinks",
            itemIds: [],
        },
    },
    allItems: {
        "item-1": {
            itemId: "item-1",
            itemLabel: "Cheeseburger",
            description: "A classic cheeseburger with melted cheese, fresh lettuce, tomato and our special sauce",
            price: 10.99,
            imageUrl: "https://kzmkxwigxq1w14q7axc9.lite.vusercontent.net/placeholder.svg?height=120&width=120",
            itemSizes: [
                {
                    itemSizeId: "item-size-1",
                    label: "Burger Only",
                    price: 10.99,
                },
                {
                    itemSizeId: "item-size-2",
                    label: "Burger with side",
                    price: 12.99,
                    optionGroupIds: ["option-group-2"],
                    preSelected: true,
                },

            ]
        },
        "item-2": {
            itemId: "item-2",
            itemLabel: "Big Mac",
            description: "The Big Mac is a hamburger with a slice of Jack cheese, diced red onions, pickles, mustard & plenty of ketchup.",
            price: 13.99,
            imageUrl: "https://kzmkxwigxq1w14q7axc9.lite.vusercontent.net/placeholder.svg?height=120&width=120",
            itemSizes: [
                {
                    itemSizeId: "item-size-1",
                    label: "Burger Only",
                    price: 13.99,
                },
                {
                    itemSizeId: "item-size-2",
                    label: "Burger with side",
                    price: 15.99,
                    optionGroupIds: ["option-group-2"],
                },
            ]
        },
        "item-3": {
            itemId: "item-3",
            itemLabel: "Chicken Burger",
            description: "A chicken burger with a bun, chicken, and a burger",
            price: 9.99,
            // imageUrl: "https://kzmkxwigxq1w14q7axc9.lite.vusercontent.net/placeholder.svg?height=120&width=120",
            itemSizes: [
                {
                    itemSizeId: "item-size-1",
                    label: "Burger Only",
                    price: 9.99,
                },
                {
                    itemSizeId: "item-size-2",
                    label: "Burger with side",
                    price: 11.99,
                    optionGroupIds: ["option-group-2"],
                },
            ]
        },
    },
    allOptionGroups: {
        "option-group-1": {
            optionGroupId: "option-group-1",
            optionGroupLabel: "Customize your burger",
            maxOptions: 0,
            minOptions: 0,
            type: "optional",
            options: [
                {
                    optionId: "option-1",
                    label: "jalapenos",
                    price: 0.5,
                    preSelected: false,
                },
                {
                    optionId: "option-2",
                    label: "picked red cabbage",
                    price: 0.5,
                    preSelected: false,
                },
                {
                    optionId: "option-3",
                    label: "red onion",
                    price: 0.5,
                    preSelected: false,
                },
                {
                    optionId: "option-4",
                    label: "mixed peppers",
                    price: 0.5,
                    preSelected: false,
                },
                {
                    optionId: "option-5",
                    label: "beef tomato",
                    price: 0.5,
                    preSelected: false,
                },
                {
                    optionId: "option-6",
                    label: "cheese",
                    price: 0.5,
                    preSelected: false,
                },
            ]
        },
        "option-group-2": {
            optionGroupId: "option-group-2",
            optionGroupLabel: "Select your side",
            maxOptions: 1,
            minOptions: 1,
            type: "mandatory",
            options: [
                {
                    optionId: "option-7",
                    label: "Onion Rings",
                    price: 0,
                    preSelected: false,
                },
                {
                    optionId: "option-8",
                    label: "French Fries",
                    price: 0,
                    preSelected: false,
                },
                {
                    optionId: "option-9",
                    label: "Garlic Bread",
                    price: 0,
                    preSelected: false,
                },
            ]
        },
        "option-group-3": {
            optionGroupId: "option-group-3",
            optionGroupLabel: "Salad dressing",
            maxOptions: 1,
            minOptions: 1,
            type: "mandatory",
            options: [
                {
                    optionId: "option-10",
                    label: "Mayo",
                    price: 0,
                    preSelected: false,
                },
                {
                    optionId: "option-11",
                    label: "Garlic Mayo",
                    price: 0,
                    preSelected: false,
                },
                {
                    optionId: "option-12",
                    label: "Yoghurt & Mint",
                    price: 0,
                    preSelected: false,
                },
                {
                    optionId: "option-13",
                    label: "Mustard",
                    price: 0,
                    preSelected: false,
                },
                {
                    optionId: "option-14",
                    label: "Classic Dressing",
                    price: 0,
                    preSelected: false,
                },
            ]
        }
    },
}