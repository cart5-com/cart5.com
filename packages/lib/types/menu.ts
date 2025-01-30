
////////////////////////////////////////////////////////////
// Menu
////////////////////////////////////////////////////////////

// while ordering, make it add multiple ones++
export type Option = {
    optionId: string;
    label: string;
    price: number;
};

export type OptionGroup = {
    optionGroupId: string;
    label: string;
    maxOptions: number;
    minOptions: number;
    optionIds?: string[];
    itemIds?: string[];
};

// while ordering, show notes
export type Item = {
    itemId: string;
    label: string;
    price: number;
    optionGroupIds: string[];
    removableIngredients?: string[];
};

export type Category = {
    categoryId: string;
    label: string;
    itemIds: string[];
};

export let sampleMenuAllOptions: Option[] = [
    // base
    { optionId: "option-tomato-base", label: "Tomato Base", price: 0 },
    { optionId: "option-bbq-base", label: "BBQ Base", price: 0 },
    { optionId: "option-chilli-base", label: "Chilli Base", price: 0 },
    // crust
    { optionId: "option-deep-pan", label: "Deep Pan", price: 0 },
    { optionId: "option-thin-crust", label: "Thin Crust", price: 0 },
    { optionId: "option-stuffed-crust", label: "Stuffed Crust", price: 2 },
    // free toppings
    { optionId: "option-cheese", label: "Cheese", price: 0 },
    { optionId: "option-pepperoni", label: "Pepperoni", price: 0 },
    { optionId: "option-mushroom", label: "Mushroom", price: 0 },
    { optionId: "option-onion", label: "Onion", price: 0 },
    { optionId: "option-pineapple", label: "Pineapple", price: 0 },
    { optionId: "option-spinach", label: "Spinach", price: 0 },
    { optionId: "option-olives", label: "Olives", price: 0 },
    { optionId: "option-peppers", label: "Peppers", price: 0 },
    { optionId: "option-anchovies", label: "Anchovies", price: 0 },
    // extra toppings
    { optionId: "option-extra-cheese", label: "Extra Cheese", price: 1 },
    { optionId: "option-extra-pepperoni", label: "Extra Pepperoni", price: 1 },
    { optionId: "option-extra-mushroom", label: "Extra Mushroom", price: 1 },
    { optionId: "option-extra-onion", label: "Extra Onion", price: 1 },
    // drinks
    { optionId: "option-coke", label: "Coke", price: 0 },
    { optionId: "option-diet-coke", label: "Diet Coke", price: 0 },
    { optionId: "option-sprite", label: "Sprite", price: 0 },
    { optionId: "option-fanta", label: "Fanta", price: 0 },
    //size
    { optionId: "option-small", label: "Small", price: 0 },
    { optionId: "option-medium", label: "Medium", price: 2 },
    { optionId: "option-large", label: "Large", price: 5 },
];

export let sampleMenuAllOptionGroups: OptionGroup[] = [
    {
        optionGroupId: "option-group-size",
        label: "Size",
        maxOptions: 1,
        minOptions: 1, // required selection
        optionIds: ["option-small", "option-medium", "option-large"],
    },
    {
        optionGroupId: "option-group-base",
        label: "Base",
        maxOptions: 1,
        minOptions: 1, // required selection
        optionIds: ["option-tomato-base", "option-bbq-base", "option-chilli-base"],
    },
    {
        optionGroupId: "option-group-crust",
        label: "Crust",
        maxOptions: 1,
        minOptions: 1, // required selection
        optionIds: ["option-deep-pan", "option-thin-crust", "option-stuffed-crust"],
    },
    {
        optionGroupId: "option-group-free-toppings",
        label: "Free Toppings",
        maxOptions: 4,
        minOptions: 0, // optional selection
        optionIds: ["option-cheese", "option-pepperoni", "option-mushroom", "option-onion", "option-pineapple", "option-spinach", "option-olives", "option-peppers", "option-anchovies"],
    },
    {
        optionGroupId: "option-group-extra-toppings",
        label: "Extra Toppings",
        maxOptions: -1, // unlimited
        minOptions: 0, // optional selection
        optionIds: ["option-extra-cheese", "option-extra-pepperoni", "option-extra-mushroom", "option-extra-onion"],
    },
    {
        optionGroupId: "option-group-deal",
        label: "Deal",
        maxOptions: 1,
        minOptions: 1, // required selection
        itemIds: ["item-margherita", "item-pepperoni", "item-cheese", "item-veggie", "item-bbq-chicken"],
    },
    {
        optionGroupId: "option-group-drinks",
        label: "Drinks",
        maxOptions: 1,
        minOptions: 1, // required selection
        optionIds: ["option-coke", "option-diet-coke", "option-sprite", "option-fanta"],
    },
];

export let sampleMenuAllItems: Item[] = [
    {
        itemId: "item-margherita",
        label: "Margherita",
        price: 10,
        optionGroupIds: ["option-group-size", "option-group-base", "option-group-crust", "option-group-free-toppings", "option-group-extra-toppings"],
        removableIngredients: ["Tomato Base", "Cheese", "Olives", "Onion"],
    },
    {
        itemId: "item-pepperoni",
        label: "Pepperoni",
        price: 12,
        optionGroupIds: ["option-group-size", "option-group-base", "option-group-crust", "option-group-free-toppings", "option-group-extra-toppings"],
        removableIngredients: ["Tomato Base", "Cheese", "Pepperoni", "Onion"],

    },
    {
        itemId: "item-cheese",
        label: "Cheese",
        price: 8,
        optionGroupIds: ["option-group-size", "option-group-base", "option-group-crust", "option-group-free-toppings", "option-group-extra-toppings"],
        removableIngredients: ["Cheese"],
    },
    {
        itemId: "item-veggie",
        label: "Veggie",
        price: 9,
        optionGroupIds: ["option-group-size", "option-group-base", "option-group-crust", "option-group-free-toppings", "option-group-extra-toppings"],
        removableIngredients: ["Tomato Base", "Cheese", "Mushroom", "Onion", "Olives", "Spinach"],
    },
    {
        itemId: "item-bbq-chicken",
        label: "BBQ Chicken",
        price: 11,
        optionGroupIds: ["option-group-size", "option-group-base", "option-group-crust", "option-group-free-toppings", "option-group-extra-toppings"],
        removableIngredients: ["Tomato Base", "Cheese", "BBQ Base", "Onion"],
    },
    {
        itemId: "item-pizza-and-drink",
        label: "Pizza + Drink",
        price: 14,
        optionGroupIds: ["option-group-deal", "option-group-drinks"],
    },
];

export let sampleMenuAllCategories: Category[] = [
    {
        categoryId: "category-pizzas",
        label: "Pizzas",
        itemIds: ["item-margherita", "item-pepperoni", "item-cheese", "item-veggie", "item-bbq-chicken"],
    },
    {
        categoryId: "category-deals",
        label: "Deals",
        itemIds: ["item-pizza-and-drink"],
    },
];