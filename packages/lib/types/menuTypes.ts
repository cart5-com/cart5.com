import type { DateTimeProp } from "./dateTimeType";

// import { type WeeklyHours } from "./restaurantTypes";
export type ItemId = string | undefined;
//  if undefined or false it will be visible, if true or date timestamp it will be hidden until the date


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
        isOutOfStock?: DateTimeProp; // boolean or date timestamp until to be out of stock
        isHidden?: DateTimeProp;
        internalName?: string;
    } | ItemId)[];
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


    taxCategoryId?: string;
    imageUrl?: string;
    optionGroupIds?: string[];
    itemSizes?: {
        itemSizeId?: string;
        label?: string;
        price?: number;
        preSelected?: boolean;
        optionGroupIds?: string[];
    }[];
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