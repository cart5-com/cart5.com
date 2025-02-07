import { ref } from "vue";
import { type RootState } from "lib/types/menuType2";

export const menu2Store = ref<RootState>({
    children: [
        "combos-1",
        "burgers-1",
        "sides-1",
        "drinks-1",
    ],
    allItems: {
        "combos-1": {
            itemId: "combos-1",
            itemLabel: "Combos",
            children: [
                "combo-1",
            ],
        },
        "burgers-1": {
            itemId: "burgers-1",
            itemLabel: "Burgers",
            children: [
                "burger-1",
                "burger-2",
            ],
        },
        "sides-1": {
            itemId: "sides-1",
            itemLabel: "Sides",
            children: [
                "side-1",
                "side-2",
                "side-3",
            ],
        },
        "drinks-1": {
            itemId: "drinks-1",
            itemLabel: "Drinks",
            children: [
                "drink-1",
                "drink-2",
            ],
        },
        "burger-1": {
            itemId: "burger-1",
            itemLabel: "Burger",
            price: 10,
            children: [
                "sides-1",
                "drinks-1",
            ],
        },
        "burger-2": {
            itemId: "burger-2",
            itemLabel: "Cheeseburger",
            price: 10,
            children: [
                "sides-1",
                "drinks-1",
            ],
        },
        "combo-1": {
            itemId: "combo-1",
            itemLabel: "Combo",
            price: 10,
            children: [
                "burgers-1",
            ],
        },
        "side-1": {
            itemId: "side-1",
            itemLabel: "Small Fries",
            price: 2,
            children: [
                "customize-fries",
            ],
        },
        "side-2": {
            itemId: "side-2",
            itemLabel: "Medium Fries",
            price: 3,
            children: [
                "customize-fries",
            ],
        },
        "side-3": {
            itemId: "side-3",
            itemLabel: "Large Fries",
            price: 4,
            children: [
                "customize-fries",
            ],
        },
        "drink-1": {
            itemId: "drink-1",
            itemLabel: "Soda",
            price: 1.2,
        },
        "drink-2": {
            itemId: "drink-2",
            itemLabel: "Water",
            price: 1,
        },
        "salt-1": {
            itemId: "salt-1",
            itemLabel: "Salt",
            price: 0,
        },
        "pepper-1": {
            itemId: "pepper-1",
            itemLabel: "Pepper",
            price: 0,
        },
        "ketchup-1": {
            itemId: "ketchup-1",
            itemLabel: "Ketchup",
            price: 0.2,
        },
        "customize-fries": {
            itemId: "customize-fries",
            itemLabel: "Customize Fries",
            children: [
                "salt-1",
                "pepper-1",
                "ketchup-1",
            ],
        },
    },
});
