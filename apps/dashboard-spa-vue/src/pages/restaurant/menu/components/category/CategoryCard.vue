<script lang="ts" setup>
import { computed } from 'vue';
import { menuRoot } from '../../store';
import { AlignJustify, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-vue-next';
import draggable from "vuedraggable"
import Button from '@/components/ui/button/Button.vue';
import Input from '@/components/ui/input/Input.vue';
import SelectWithSearch from '@/ui-plus/SelectWithSearch/SelectWithSearch.vue';
import ItemCard from '../item/ItemCard.vue';
import { addChildItem, createNewItem } from '@src/pages/restaurant/menu/helpers';

const props = defineProps<{
    itemId: string
    showCategories: boolean
    toggleCategories: () => void
}>()

const currentItem = computed(() => {
    return menuRoot.value?.allItems?.[props.itemId]
})

async function removeCategory() {
    if (!confirm('Are you sure you want to remove this category?')) return;
    if (!menuRoot.value || !currentItem.value?.itemId) return;

    // Remove from root children
    if (menuRoot.value.children) {
        const index = menuRoot.value.children.indexOf(currentItem.value.itemId);
        if (index > -1) {
            menuRoot.value.children.splice(index, 1);
        }
    }

    // Remove from allItems
    if (menuRoot.value.allItems && currentItem.value.itemId) {
        delete menuRoot.value.allItems[currentItem.value.itemId];
    }
}
</script>
<template>
    <div class="category-container border rounded-lg mb-12 bg-background"
         v-if="currentItem">
        <div class="flex justify-between items-center border-b border-muted-foreground p-2 ">
            <div class="text-2xl font-bold flex-1">
                <Input v-model="currentItem.itemLabel"
                       class="text-2xl font-bold h-10 focus:ring-0 border-none capitalize"
                       autofocus />
            </div>
            <div class="flex items-center gap-2">
                <AlignJustify class="cat-drag-handle cursor-move" />
                <div class="cursor-pointer"
                     @click="toggleCategories">
                    <ChevronUp v-if="showCategories" />
                    <ChevronDown v-else />
                </div>
            </div>
        </div>
        <div v-if="showCategories">
            <draggable v-model="currentItem.children"
                       item-key="itemId"
                       group="category-items"
                       handle=".item-drag-handle"
                       class="grid grid-cols-1 gap-6 lg:grid-cols-2  p-2 my-4">
                <template #item="{ element: itemId }">
                    <ItemCard :itemId="itemId"
                              :categoryId="currentItem.itemId" />
                </template>
            </draggable>
            <div class="p-2">
                <SelectWithSearch :items="Object.values(menuRoot.allItems ?? {})
                    .filter(item => !menuRoot.children?.includes(item.itemId ?? ''))
                    .map(item => ({
                        key: item.itemId,
                        name: item.itemLabel
                    }))"
                                  @select="(selectedItem) => {
                                    addChildItem(currentItem?.itemId, selectedItem.key)
                                }"
                                  @create-new="(search) => { createNewItem(search, currentItem?.itemId, 'New category') }"
                                  :has-new-button="true"
                                  heading="Link an existing item">
                    <template #trigger>
                        <Button variant="outline">
                            <Plus /> Add item to '{{ currentItem?.itemLabel }}'
                        </Button>
                    </template>
                </SelectWithSearch>


                <Button variant="destructive"
                        class="ml-4"
                        @click="removeCategory">
                    <Trash2 class="h-4 w-4" /> Remove category
                </Button>

            </div>
        </div>
    </div>
</template>