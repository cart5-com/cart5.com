import { type WeeklyHours } from "./restaurantTypes";

export type ItemId = string | undefined;

//  if undefined or false it will be visible, if true or date timestamp it will be hidden until the date
export type UntilToCheck = boolean | number; // boolean or date timestamp,

export type LimitedTime = {
    type?: "always" | "weekdays" | "date-range";
    alwaysValue?: boolean;
    weekdaysValue?: WeeklyHours,
    dateRangeValue?: {
        start?: number; // date timestamp
        end?: number; // date timestamp
    }
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
    isLimitedTime?: LimitedTime
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
    isLimitedTime?: LimitedTime
    itemIds?: string[];
    optionGroupIds?: string[];
};

export type MenuJSON = {
    categoryIdsOrder?: string[];
    allCategories?: Record<string, Category>;
    allItems?: Record<string, Item>;
    allOptionGroups?: Record<string, OptionGroup>;
}