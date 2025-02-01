<script lang="ts" setup>
import { ref } from "vue";
import {
    AlignJustify,
    ChevronDown,
    ChevronUp,
    Pencil,
    Plus
} from "lucide-vue-next";
import { Badge } from '@/components/ui/badge'
import draggable from "vuedraggable";
import { Button } from "@/components/ui/button";
import { WeeklyScheduleAsString } from "lib/types/menuTypes";
import type { MenuJSON } from "lib/types/menuTypes";
import ItemCard from "./ItemCard.vue";

const showCategories = ref(true);

defineProps<{
    menuJSON: MenuJSON,
    openCategoryDialog: (categoryId: string) => void,
    addNewCategory: () => void
}>()
</script>
<template>
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
                        <Badge class="line-clamp-1"
                               :style="{ maxWidth: '10ch' }"
                               v-if="
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
                        <ItemCard :menuJSON="menuJSON"
                                  :itemId="itemId" />
                    </template>
                </draggable>
            </div>
        </template>
    </draggable>
    <Button class="my-4"
            variant="outline"
            @click="addNewCategory">
        <Plus /> Add New Category
    </Button>
</template>