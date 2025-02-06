import type { DateTimeProp } from "./dateTimeType";

// export type Bucket = BucketItem[];

export type LinkTypes = {
    //     // not active right now
    //     type: "item";
    //     itemId?: string;
    // } | {
    //     // not active right now
    //     type: "item-size";
    //     itemId?: string;
    //     sizeId?: string;
    // } | {
    // Active ⭐️⭐️⭐️
    // <draggable v-model="option.optionLinks" item-key="optionGroupId"
    type: "option-group";
    optionGroupId?: string;
}

export type Option = {
    optionId?: string;
    label?: string; // TODO: should it override the linkedItem labels?
    price?: number; // overrides the all other prices
    preSelected?: boolean;
    optionLinks?: LinkTypes[];
}

export type OptionGroup = {
    optionGroupId?: string;
    optionGroupLabel?: string;
    // TODO: add internal name
    options?: Option[];

    // minOptions: 1, maxOptions: 1 -> Mandatory single-choice
    // minOptions: 0, maxOptions: 1 -> Optional single-choice
    // minOptions: 0, maxOptions: 1+ -> Optional 1+ - choice

    // minOptions: 1, maxOptions: 0 -> Mandatory multi-choice
    // minOptions: 0, maxOptions: 0 -> Optional multi-choice

    maxOptions?: number; // 1 for single choice, >1 for multi-choice, 0 for unlimited
    minOptions?: number; // 0 for optional, ≥1 for required
}

export type ItemSize = {
    itemSizeId?: string;
    itemSizeLabel?: string;
    price?: number;
    preSelected?: boolean;
    optionGroupIds?: string[];
}

export type BucketOptionGroup = {
    optionGroupId?: string;
    options?: Record<string, {
        optionId?: string;
        quantity: number;
        // selection.length should reflect the quantity
        // because it's an array of array:'BucketOptionGroup[]'
        selectedOption_optionGroupIds?: (BucketOptionGroup[])[];
    }>;
}

export type BucketItem = {
    quantity?: number;
    selectedItemId?: string;
    selectedSizeId?: string;

    selectedItem_optionGroupIds?: BucketOptionGroup[];
    selectedSize_optionGroupIds?: BucketOptionGroup[];
}

export type Item = {
    itemId?: string;
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
