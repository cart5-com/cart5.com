<script lang="ts" setup>
import { computed } from 'vue';
import { menuRoot } from '../../store';
import { AlignJustify, ChevronDown, ChevronUp, MoveIcon, Pencil } from 'lucide-vue-next';
import draggable from "vuedraggable"

const props = defineProps<{
    itemId: string
    showCategories: boolean
    toggleCategories: () => void
}>()

const currentItem = computed(() => {
    return menuRoot.value?.allItems?.[props.itemId]
})
</script>
<template>
    <div class="category-container border rounded-lg mb-12 bg-background">
        <div class="flex justify-between items-center border-b border-muted-foreground p-2 ">
            <h1 class="text-2xl font-bold">
                {{ currentItem?.itemLabel }}
            </h1>
            <div class="flex items-center gap-2">
                <AlignJustify class="cat-drag-handle cursor-move" />
                <Pencil class="cursor-pointer"
                        @click="" />
                <div class="cursor-pointer"
                     @click="toggleCategories">
                    <ChevronUp v-if="showCategories" />
                    <ChevronDown v-else />
                </div>
            </div>
        </div>
        <div v-if="showCategories && currentItem">
            <draggable v-model="currentItem.children"
                       item-key="itemId"
                       group="items"
                       handle=".item-drag-handle"
                       class="grid grid-cols-1 gap-6 lg:grid-cols-2  p-2 mt-4">
                <template #item="{ element: itemId }">
                    <div>
                        {{ menuRoot.allItems?.[itemId]?.itemLabel }}
                        <MoveIcon class="item-drag-handle cursor-move" />
                    </div>
                </template>
            </draggable>
        </div>
    </div>
</template>