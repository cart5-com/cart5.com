<script lang="ts" setup>
import { computed, ref } from "vue";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { pageTitle } from '@src/stores/layout.store'
import draggable from "vuedraggable";
import { AlignJustify, ChevronDown, ChevronUp, MoveIcon } from "lucide-vue-next";
import { Input } from "@/components/ui/input";

pageTitle.value = 'Menu Editor'

type ItemId = string | undefined;

type OptionGroup = {
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
        isOutOfStock?: boolean;
        isHidden?: boolean;
        internalName?: string;
    } | ItemId)[];
}

type Item = {
    itemId?: ItemId;
    itemLabel?: string;
    description?: string;
    price?: number;
    imageUrl?: string;
    itemSizes?: {
        itemSizeId?: string;
        label?: string;
        price?: number;
        preSelected?: boolean;
        optionGroupIds?: string[];
    }[];
    optionGroupIds?: string[];
};

type Category = {
    catId?: string;
    categoryLabel?: string;
    isHidden?: boolean;
    itemIds?: string[];
    optionGroupIds?: string[];
};

const allOptionGroups = ref<OptionGroup[]>([
    {
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
    {
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
    {
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

])

const allItems = ref<Item[]>([
    {
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
            },

        ]
    },
    {
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
    {
        itemId: "item-3",
        itemLabel: "Chicken Burger",
        description: "A chicken burger with a bun, chicken, and a burger",
        price: 9.99,
        imageUrl: "https://kzmkxwigxq1w14q7axc9.lite.vusercontent.net/placeholder.svg?height=120&width=120",
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
]);

const allCategories = ref<Category[]>([
    {
        catId: "cat-1",
        categoryLabel: "Burgers",
        itemIds: [
            "item-1",
            "item-2",
            "item-3",
        ],
    },
    {
        catId: "cat-2",
        categoryLabel: "Pizzas",
        itemIds: [],
    },
    {
        catId: "cat-3",
        categoryLabel: "Drinks",
        itemIds: [],
    },
]);



const itemsMap = computed(() => {
    console.log("itemsMap", allItems.value)
    return new Map(allItems.value.map(item => [item.itemId, item]))
});

const showCategories = ref(true);
</script>


<template>
    <div class="p-0 sm:p-2">
        <div class="mx-auto">
            <draggable v-model="allCategories"
                       group="categories"
                       handle=".cat-drag-handle"
                       item-key="catId">
                <template #item="{ element: category }">
                    <div class="category-container border rounded-lg mb-12 bg-background">
                        <div class="flex justify-between items-center border-b border-muted-foreground p-2 ">
                            <h1 class="text-2xl font-bold">{{ category.categoryLabel }}</h1>
                            <div class="flex items-center gap-2">
                                <AlignJustify class="cursor-pointer cat-drag-handle" />
                                <div class="cursor-pointer"
                                     @click="showCategories = !showCategories">
                                    <ChevronUp v-if="showCategories" />
                                    <ChevronDown v-else />
                                </div>
                            </div>
                        </div>
                        <draggable v-if="showCategories"
                                   v-model="category.itemIds"
                                   group="items"
                                   item-key="itemId"
                                   handle=".item-drag-handle"
                                   class="grid grid-cols-1 gap-6 lg:grid-cols-2  p-2 mt-4">
                            <template #item="{ element: itemId }">
                                <div class="flex bg-card rounded-lg overflow-hidden border">
                                    <Card class="flex-grow border-none">
                                        <CardHeader>
                                            <CardTitle class="flex items-center gap-2">
                                                <div class="item-drag-handle cursor-grab active:cursor-grabbing"
                                                     style="touch-action: none">
                                                    <MoveIcon />
                                                </div>
                                                <Input :model-value="itemsMap.get(itemId)?.itemLabel"
                                                       @update:model-value="(
                                                        newValue: string | number
                                                    ) => {
                                                        const item = itemsMap.get(itemId);
                                                        if (item) {
                                                            item.itemLabel = newValue.toString();
                                                        }
                                                    }"
                                                       type="text" />
                                            </CardTitle>
                                            <CardDescription>
                                                ${{ itemsMap.get(itemId)?.price?.toFixed(2) }}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p class="text-xs line-clamp-3">
                                                {{ itemsMap.get(itemId)?.description }}
                                            </p>
                                        </CardContent>
                                        <CardFooter>
                                            <!-- <Button class="w-full">Add to Cart</Button> -->
                                        </CardFooter>
                                    </Card>

                                    <div class="flex-shrink-0">
                                        <div class="flex items-center justify-center h-full">
                                            <img v-if="itemsMap.get(itemId)?.imageUrl"
                                                 :src="itemsMap.get(itemId)?.imageUrl"
                                                 :alt="itemsMap.get(itemId)?.itemLabel"
                                                 loading="lazy"
                                                 class="h-full w-48 object-cover overflow-hidden" />
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </draggable>
                    </div>
                </template>
            </draggable>
        </div>
        <div>
            <details>
                <summary>All Items</summary>
                <pre>{{ allItems }}</pre>
            </details>
            <details>
                <summary>All Categories</summary>
                <pre>{{ allCategories }}</pre>
            </details>
        </div>
    </div>
</template>

<style scoped>
.sortable-chosen {
    /* background-color: rgba(0, 0, 0, 0.02); */
    border: 1px dashed rgba(var(--primary));
}
</style>