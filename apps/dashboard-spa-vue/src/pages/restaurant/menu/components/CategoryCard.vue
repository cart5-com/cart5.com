<script lang="ts" setup>
import {
    AlignJustify,
    ChevronDown,
    ChevronUp,
    Pencil,
    Plus,
} from "lucide-vue-next";
import { Badge } from '@/components/ui/badge'
import draggable from "vuedraggable";
import { WeeklyScheduleAsString } from "lib/types/menuTypes";
import type { MenuJSON } from "lib/types/menuTypes";
import ItemCard from "../components/ItemCard.vue";
import { Button } from "@/components/ui/button";

const props = defineProps<{
    menuJSON: MenuJSON,
    categoryId: string,
    openCategoryDialog: (categoryId: string) => void,
    toggleCategories: () => void,
    showCategories: boolean,
}>()

const addNewItem = (categoryId: string) => {
    const newItemId = `item-${Date.now()}`
    if (props.menuJSON && props.menuJSON) {
        // Initialize allItems if it doesn't exist
        if (!props.menuJSON.allItems) {
            props.menuJSON.allItems = {}
        }

        // Create new item
        props.menuJSON.allItems[newItemId] = {
            itemId: newItemId,
            itemLabel: 'New Item',
            price: 0,
            description: '',
            itemSizes: []
        }

        // Add item to category
        if (props.menuJSON.allCategories?.[categoryId]) {
            if (!props.menuJSON.allCategories[categoryId].itemIds) {
                props.menuJSON.allCategories[categoryId].itemIds = []
            }
            props.menuJSON.allCategories[categoryId].itemIds?.push(newItemId)
        }
    }
}
</script>
<template>
    <div class="category-container border rounded-lg mb-12 bg-background">
        <div class="flex justify-between items-center border-b border-muted-foreground p-2 ">
            <h1 class="text-2xl font-bold">
                {{ menuJSON?.allCategories?.[categoryId]?.categoryLabel }}
                <Badge v-if="
                    menuJSON?.allCategories?.[categoryId]?.isLimitedTime?.type === 'always' &&
                    menuJSON?.allCategories?.[categoryId]?.isLimitedTime?.alwaysValue
                "
                       variant="outline">
                    DEBUG:Always
                </Badge>
                <Badge class="line-clamp-1"
                       :style="{ maxWidth: '10ch' }"
                       v-if="
                        menuJSON?.allCategories?.[categoryId]?.isLimitedTime?.type === 'weeklySchedule' &&
                        menuJSON?.allCategories?.[categoryId]?.isLimitedTime?.weeklyScheduleValue
                    "
                       variant="outline">
                    DEBUG: {{
                        WeeklyScheduleAsString(menuJSON?.allCategories?.[categoryId]?.isLimitedTime?.weeklyScheduleValue)
                    }}
                </Badge>
            </h1>
            <div class="flex items-center gap-2">
                <AlignJustify class="cursor-pointer cat-drag-handle" />
                <Pencil class="cursor-pointer"
                        @click="openCategoryDialog(categoryId)" />
                <div class="cursor-pointer"
                     @click="toggleCategories">
                    <ChevronUp v-if="showCategories" />
                    <ChevronDown v-else />
                </div>
            </div>
        </div>
        <div v-if="showCategories">
            <draggable v-model="menuJSON.allCategories[categoryId].itemIds"
                       group="items"
                       item-key="itemId"
                       handle=".item-drag-handle"
                       class="grid grid-cols-1 gap-6 lg:grid-cols-2  p-2 mt-4">
                <template #item="{ element: itemId }">
                    <ItemCard :menuJSON="menuJSON"
                              :itemId="itemId" />
                </template>
            </draggable>

            <div class="flex justify-center">
                <Button variant="outline"
                        @click="addNewItem(categoryId)">
                    <Plus /> Add item to {{ menuJSON?.allCategories?.[categoryId]?.categoryLabel }}
                </Button>
            </div>
        </div>
    </div>
</template>
