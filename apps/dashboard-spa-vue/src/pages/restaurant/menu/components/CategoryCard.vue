<script lang="ts" setup>
import {
    AlignJustify,
    ChevronDown,
    ChevronUp,
    Link2,
    Pencil,
    Plus,
} from "lucide-vue-next";
import draggable from "vuedraggable";
import { menuJSON } from "../store";
import ItemCard from "../components/ItemCard.vue";
import { Button } from "@/components/ui/button";
import SelectWithSearch from "@/ui-plus/SelectWithSearch.vue";
import { useMenuOperations } from '../composables/useMenuOperations';
const { openCategoryDialog } = useMenuOperations()

defineProps<{
    categoryId: string,
    toggleCategories: () => void,
    showCategories: boolean,
}>()

const addNewItem = (categoryId: string) => {
    const newItemId = `item-${Date.now()}`
    if (menuJSON.value) {
        // Initialize allItems if it doesn't exist
        if (!menuJSON.value.allItems) {
            menuJSON.value.allItems = {}
        }

        // Create new item
        menuJSON.value.allItems[newItemId] = {
            itemId: newItemId,
            itemLabel: `New Item ${Object.keys(menuJSON.value.allItems).length + 1}`,
            price: 1,
        }

        // Add item to category
        addItemToCategory(categoryId, newItemId)
    }
}

const addItemToCategory = (categoryId: string, itemId: string) => {
    if (menuJSON.value.allCategories?.[categoryId]) {
        if (!menuJSON.value.allCategories[categoryId].itemIds) {
            menuJSON.value.allCategories[categoryId].itemIds = []
        }
        menuJSON.value.allCategories[categoryId].itemIds?.push(itemId)
    }
}
</script>
<template>
    <div class="category-container border rounded-lg mb-12 bg-background">
        <div class="flex justify-between items-center border-b border-muted-foreground p-2 ">
            <h1 class="text-2xl font-bold">
                {{ menuJSON?.allCategories?.[categoryId]?.categoryLabel }}
            </h1>
            <div class="flex items-center gap-2">
                <AlignJustify class="cat-drag-handle cursor-move" />
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
                              :itemId="itemId"
                              :categoryId="categoryId" />
                </template>
            </draggable>

            <Button variant="outline"
                    @click="addNewItem(categoryId)">
                <Plus /> Add item to '{{ menuJSON?.allCategories?.[categoryId]?.categoryLabel }}'
            </Button>


            <SelectWithSearch v-if="Object.keys(menuJSON?.allItems ?? {}).length > 0"
                              :items="Object.values(menuJSON?.allItems ?? {}).map((item) => ({
                                key: item.itemId,
                                name: item.itemLabel
                            }))"
                              @select="(item) => {
                                addItemToCategory(categoryId, item.key)
                            }">
                <template #trigger>
                    <Button variant="outline">
                        <Link2 /> Link item
                    </Button>
                </template>
            </SelectWithSearch>
        </div>
    </div>
</template>

<style scoped>
.sortable-chosen {
    border: 1px dashed rgba(var(--primary));
}

.sortable-ghost {
    opacity: 0.5;
    border: 1px dashed rgba(var(--secondary));
}
</style>