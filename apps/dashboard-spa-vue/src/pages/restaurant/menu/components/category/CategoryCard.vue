<script lang="ts" setup>
import { computed } from 'vue';
import { menuRoot } from '../../store';
import { AlignJustify, ChevronDown, ChevronUp, MoveIcon, Pencil, Plus } from 'lucide-vue-next';
import draggable from "vuedraggable"
import Button from '@/components/ui/button/Button.vue';
import SelectWithSearch from '@/ui-plus/SelectWithSearch/SelectWithSearch.vue';

const props = defineProps<{
    itemId: string
    showCategories: boolean
    toggleCategories: () => void
}>()

const currentItem = computed(() => {
    return menuRoot.value?.allItems?.[props.itemId]
})

async function createNewItem(search: string) {
    const newItem = {
        itemId: `item-${Date.now()}`,
        itemLabel: search ? search : `New item ${Object.keys(menuRoot.value?.allItems ?? {}).length + 1}`
    }
    if (!menuRoot.value?.allItems) {
        menuRoot.value.allItems = {}
    }
    menuRoot.value.allItems[newItem.itemId] = newItem
    return addItemToCategory(newItem.itemId);
}

async function addItemToCategory(itemId: string) {
    if (currentItem.value && !currentItem.value?.children) {
        currentItem.value.children = []
    }
    currentItem.value?.children?.push(itemId)
    return itemId;
}
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
                    <div class="border rounded-lg p-2 m-2">
                        {{ menuRoot.allItems?.[itemId]?.itemLabel }}
                        <MoveIcon class="item-drag-handle cursor-move" />
                    </div>
                </template>
            </draggable>
        </div>
        <div>

            <SelectWithSearch :items="Object.values(menuRoot.allItems ?? {})
                .filter(item => !menuRoot.children?.includes(item.itemId ?? ''))
                .map(item => ({
                    key: item.itemId,
                    name: item.itemLabel
                }))"
                              @select="(item: any) => {
                                addItemToCategory(item.key)
                            }"
                              @create-new="(search) => { createNewItem(search) }"
                              :has-new-button="true"
                              heading="Link an existing item">
                <template #trigger>
                    <Button variant="outline">
                        <Plus /> Add item to '{{ currentItem?.itemLabel }}'
                    </Button>
                </template>
            </SelectWithSearch>
        </div>
    </div>
</template>