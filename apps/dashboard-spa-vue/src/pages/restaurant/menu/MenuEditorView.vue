<script lang="ts" setup>
import { computed, ref } from "vue";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { pageTitle } from '@src/stores/layout.store'
import draggable from "vuedraggable";
import { AlignJustify, MoveIcon } from "lucide-vue-next";
import { Input } from "@/components/ui/input";

pageTitle.value = 'Menu Editor'

type Item = {
    itemId?: string;
    label?: string;
    price?: number;
};

type Category = {
    catId?: string;
    label?: string;
    itemIds?: string[];
};

const allItems = ref<Item[]>([
    {
        itemId: "item-1",
        label: "Item 1",
        price: 10,
    },
    {
        itemId: "item-2",
        label: "Item 2",
        price: 20,
    },
    {
        itemId: "item-3",
        label: "Item 3",
        price: 30,
    },
]);

const allCategories = ref<Category[]>([
    {
        catId: "category-1",
        label: "Category 1",
        itemIds: ["item-2", "item-3"],
    },
    {
        catId: "category-2",
        label: "Category 2",
        itemIds: ["item-1"],
    },
    {
        catId: "category-3",
        label: "Category 3",
        itemIds: ["item-1", "item-2", "item-3"],
    },
]);


const itemsMap = computed(() =>
    new Map(allItems.value.map(item => [item.itemId, item]))
);

</script>


<template>
    <div class="">
        <div class="mx-auto">
            <draggable v-model="allCategories"
                       group="categories"
                       handle=".cat-drag-handle"
                       item-key="catId">
                <template #item="{ element: category }">
                    <div class="category-container border rounded-lg my-4 bg-background">
                        <div class="flex justify-between items-center border-b mb-4 p-2">
                            <h1 class="text-2xl font-bold">{{ category.label }}</h1>
                            <AlignJustify class="cursor-pointer cat-drag-handle" />
                        </div>
                        <draggable v-model="category.itemIds"
                                   group="items"
                                   item-key="itemId"
                                   handle=".item-drag-handle"
                                   class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 p-2">
                            <template #item="{ element: itemId }">
                                <Card class="overflow-hidden transition-shadow hover:shadow-lg">
                                    <!-- <img :src="item.image" :alt="item.name" class="w-full h-48 object-cover" /> -->
                                    <CardHeader>
                                        <div class="flex items-center justify-between gap-2">
                                            <div>
                                                <CardTitle>
                                                    <Input :model-value="itemsMap.get(itemId)?.label"
                                                           @update:model-value="(
                                                            newValue: string | number
                                                        ) => {
                                                            const item = itemsMap.get(itemId);
                                                            if (item) {
                                                                item.label = newValue.toString();
                                                            }
                                                        }"
                                                           type="text" />
                                                </CardTitle>
                                                <CardDescription>description</CardDescription>
                                            </div>
                                            <div class="item-drag-handle cursor-grab active:cursor-grabbing"
                                                 style="touch-action: none">
                                                <MoveIcon />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p class="text-lg font-bold">${{ itemsMap.get(itemId)?.price?.toFixed(2) }}</p>
                                    </CardContent>
                                    <CardFooter>
                                        <!-- <Button class="w-full">Add to Cart</Button> -->
                                    </CardFooter>
                                </Card>
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