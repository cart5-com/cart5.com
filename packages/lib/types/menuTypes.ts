import type { DateTimeProp } from "./dateTimeType";

// import { type WeeklyHours } from "./restaurantTypes";
export type ItemId = string | undefined;
//  if undefined or false it will be visible, if true or date timestamp it will be hidden until the date

export type LinkedItem = ItemId | {
    itemId?: string;
    sizeId?: string;
}

export type Option = {
    optionId?: string;
    label?: string; // TODO: should it override the linkedItem labels?
    price?: number; // overrides the all other prices
    linkedItems?: LinkedItem[];
}

export type OptionGroup = {
    optionGroupId?: string;
    optionGroupLabel?: string;
    options?: Option[];

    // minOptions: 1, maxOptions: 1 -> Mandatory single-choice
    // minOptions: 0, maxOptions: 1 -> Optional single-choice
    // minOptions: 0, maxOptions: 1+ -> Optional 1+ - choice

    // minOptions: 1, maxOptions: 0 -> Mandatory multi-choice
    // minOptions: 0, maxOptions: 0 -> Optional multi-choice

    maxOptions?: number;
    minOptions?: number;
}

export type ItemSize = {
    itemSizeId?: string;
    itemSizeLabel?: string;
    price?: number;
    preSelected?: boolean;
    optionGroupIds?: string[];
}

export type Item = {
    itemId?: ItemId;
    internalName?: string;
    itemLabel?: string;
    description?: string;
    price?: number;
    itemLabels?: string[];  // Hot, Vegan, Vegetarian, Gluten-free, Halal, Dairy-free, Raw, Nut-free
    removeableIngredients?: string[]; // to make them removeable from the item
    allergens?: string[]; // Milk, Tree nuts, Eggs, Peanuts, Fish, Wheat, Shellfish, Soybeans
    additives?: string[]; // Artificial colours, Artificial sweeteners, Artificial flavours, Preservatives
    isOutOfStock?: DateTimeProp;
    isHidden?: DateTimeProp;
    isSpecialInstructionsHidden?: boolean;
    itemSizes?: ItemSize[];

    optionGroupIds?: string[];

    taxCategoryId?: string;
    imageUrl?: string;
};

export const ITEM_LABELS = [
    "hot",
    "vegan",
    "vegetarian",
    "gluten-free",
    "halal",
    "dairy-free",
    "raw",
    "nut-free",
]

export const ALLERGENS = [
    "milk",
    "tree nuts",
    "eggs",
    "peanuts",
    "fish",
    "wheat",
    "shellfish",
    "soybeans",
]

export const ADDITIVES = [
    "artificial colours",
    "artificial sweeteners",
    "artificial flavours",
    "preservatives",
]

export type Category = {
    catId?: string;
    categoryLabel?: string;
    isHidden?: DateTimeProp;
    itemIds?: string[];
};

export type MenuJSON = {
    categoryIdsOrder?: string[];
    allCategories?: Record<string, Category>;
    allItems?: Record<string, Item>;
    allOptionGroups?: Record<string, OptionGroup>;
}
