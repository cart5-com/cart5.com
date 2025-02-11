<script lang="ts" setup>
import { computed } from 'vue';
import { menuRoot } from '../store';
import { AlignJustify, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-vue-next';
import draggable from "vuedraggable"
import Button from '@/components/ui/button/Button.vue';
import SelectWithSearch from '@/ui-plus/SelectWithSearch/SelectWithSearch.vue';
import ItemCard from './ItemCard.vue';
import { addChildItem, createNewItem, editItem } from '../helpers';
import InputInline from '@/ui-plus/inline-edit/InputInline.vue';

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

const onClickAddNewItem = (search: string | undefined) => {
    const existingOnes = Object.values(menuRoot.value.allItems ?? {}).filter(item => item.type === 'item');
    const itemLabel = search ? search : `New item ${existingOnes.length + 1}`;
    const parentItemId = currentItem?.value?.itemId;
    const newItemId = createNewItem('item', { itemLabel }, parentItemId);
    setTimeout(() => {
        editItem(newItemId)
    }, 500)
}
</script>
<template>
    <div class="category-container border rounded-lg mb-12 bg-background"
         v-if="currentItem">
        <div class="flex justify-between items-center border-b border-muted-foreground p-2 ">
            <div class="text-2xl font-bold flex-1">
                <InputInline v-model="currentItem.itemLabel">
                    <template #trigger>
                        <span class="text-2xl font-bold h-10 focus:ring-0 border-none capitalize cursor-text">
                            {{ currentItem.itemLabel || 'Name:' }}
                        </span>
                    </template>
                </InputInline>
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
                    .filter(item => item.type !== 'category')
                    .map(item => ({
                        key: item.itemId,
                        name: item.itemLabel
                    }))"
                                  @select="(selectedItem) => {
                                    addChildItem(currentItem?.itemId, selectedItem.key)
                                }"
                                  @create-new="onClickAddNewItem"
                                  :has-new-button="true"
                                  heading="Link an existing item">
                    <template #trigger>
                        <Button variant="outline">
                            <Plus /> Add item
                            <!-- to '<span class="capitalize">{{ currentItem?.itemLabel }}</span>' -->
                        </Button>
                    </template>
                </SelectWithSearch>


                <Button variant="destructive"
                        class="ml-4"
                        @click="removeCategory">
                    <Trash2 class="h-4 w-4" /> Remove
                </Button>

            </div>
        </div>
    </div>
</template>