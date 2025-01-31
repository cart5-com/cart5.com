<script lang="ts" setup>
import { ref } from "vue";
import { pageTitle } from '@src/stores/layout.store'
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from "@/components/ui/card";
import { AlignJustify, ChevronDown, ChevronUp, MoveIcon, Pencil } from "lucide-vue-next";
import { Badge } from '@/components/ui/badge'

import draggable from "vuedraggable";
import { menuJSON, currentCategoryId } from "./MenuStore";
import CategoryDialog from "./CategoryDialog.vue";
import { Button } from "@/components/ui/button";
import { WeeklyScheduleAsString } from "lib/types/menuTypes";
pageTitle.value = 'Menu Editor'
const showCategories = ref(true);
const categoryDialog = ref<InstanceType<typeof CategoryDialog>>();

function openCategoryDialog(categoryId: string) {
    currentCategoryId.value = categoryId
    if (categoryDialog.value) {
        categoryDialog.value.isOpen = true
    }
}

const addNewCategory = () => {
    const newCatId = `cat-${Date.now()}`
    if (!menuJSON.value) {
        menuJSON.value = {
            allCategories: {},
            categoryIdsOrder: [],
            allItems: {},
            allOptionGroups: {}
        }
    }
    if (menuJSON && menuJSON.value) {
        if (!menuJSON.value.allCategories) {
            menuJSON.value.allCategories = {}
        }
        menuJSON.value.allCategories[newCatId] = {
            catId: newCatId,
            categoryLabel: 'New Category',
            itemIds: []
        }
        if (!menuJSON.value.categoryIdsOrder) {
            menuJSON.value.categoryIdsOrder = []
        }
        menuJSON.value.categoryIdsOrder.push(newCatId)
    }
}
</script>


<template>
    <div class="p-0 sm:p-2">
        <div class="mx-auto">
            <CategoryDialog ref="categoryDialog" />
            <Button class="my-4"
                    variant="outline"
                    @click="addNewCategory">Add New Category</Button>
            <draggable v-if="menuJSON"
                       v-model="menuJSON.categoryIdsOrder"
                       group="categories"
                       handle=".cat-drag-handle"
                       item-key="catId">
                <template #item="{ element: categoryId }">
                    <div class="category-container border rounded-lg mb-12 bg-background">
                        <div class="flex justify-between items-center border-b border-muted-foreground p-2 ">
                            <h1 class="text-2xl font-bold">
                                {{ menuJSON?.allCategories?.[categoryId]?.categoryLabel }}
                                <Badge v-if="
                                    menuJSON?.allCategories?.[categoryId]?.isLimitedTime?.type === 'always' &&
                                    menuJSON?.allCategories?.[categoryId]?.isLimitedTime?.alwaysValue
                                "
                                       variant="outline">
                                    Always
                                </Badge>
                                <Badge v-if="
                                    menuJSON?.allCategories?.[categoryId]?.isLimitedTime?.type === 'weeklySchedule' &&
                                    menuJSON?.allCategories?.[categoryId]?.isLimitedTime?.weeklyScheduleValue
                                "
                                       variant="outline">
                                    {{ WeeklyScheduleAsString(menuJSON?.allCategories?.[categoryId]?.isLimitedTime?.weeklyScheduleValue) }}
                                </Badge>
                            </h1>
                            <div class="flex items-center gap-2">
                                <AlignJustify class="cursor-pointer cat-drag-handle" />
                                <Pencil class="cursor-pointer"
                                        @click="openCategoryDialog(categoryId)" />
                                <div class="cursor-pointer"
                                     @click="showCategories = !showCategories">
                                    <ChevronUp v-if="showCategories" />
                                    <ChevronDown v-else />
                                </div>
                            </div>
                        </div>
                        <draggable v-if="showCategories && menuJSON && menuJSON.allCategories"
                                   v-model="menuJSON.allCategories[categoryId].itemIds"
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
                                                <h1 class="text-lg font-bold">
                                                    {{ menuJSON?.allItems?.[itemId]?.itemLabel }}
                                                </h1>
                                                <!-- <Input :model-value="itemsMap.get(itemId)?.itemLabel"
                                                       @update:model-value="(
                                                        newValue: string | number
                                                    ) => {
                                                        const item = itemsMap.get(itemId);
                                                        if (item) {
                                                            item.itemLabel = newValue.toString();
                                                        }
                                                    }"
                                                       type="text" /> -->
                                            </CardTitle>
                                            <CardDescription>
                                                ${{ menuJSON?.allItems?.[itemId]?.price?.toFixed(2) }}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p class="text-xs line-clamp-3">
                                                {{ menuJSON?.allItems?.[itemId]?.description }}
                                            </p>
                                        </CardContent>
                                        <CardFooter>
                                            <!-- <Button class="w-full">Add to Cart</Button> -->
                                        </CardFooter>
                                    </Card>

                                    <div class="flex-shrink-0"
                                         v-if="menuJSON?.allItems?.[itemId]?.imageUrl">
                                        <div class="flex items-center justify-center h-full">
                                            <img :src="menuJSON?.allItems?.[itemId]?.imageUrl"
                                                 :alt="menuJSON?.allItems?.[itemId]?.itemLabel"
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
            <Button class="my-4"
                    variant="outline"
                    @click="addNewCategory">Add New Category</Button>
        </div>
        <div>
            <details>
                <summary>menuJSON</summary>
                <pre>{{ menuJSON }}</pre>
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