<script lang="ts" setup>
import { computed } from 'vue';
import { menuRoot } from '../MenuRootStore';
import { AlignJustify, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-vue-next';
import draggable from "vuedraggable"
import Button from '@/components/ui/button/Button.vue';
import SelectWithSearch from '@/ui-plus/SelectWithSearch/SelectWithSearch.vue';
import ItemCard from './ItemCard.vue';
import { addChildItem, createNewItem, previewItem } from '../helpers';
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
    if (!menuRoot.value || !currentItem.value?.id) return;

    // Remove from root children
    if (menuRoot.value.children) {
        const index = menuRoot.value.children.indexOf(currentItem.value.id);
        if (index > -1) {
            menuRoot.value.children.splice(index, 1);
        }
    }

    // Remove from allItems
    if (menuRoot.value.allItems && currentItem.value.id) {
        delete menuRoot.value.allItems[currentItem.value.id];
    }
}

const onClickAddNewItem = (search: string | undefined) => {
    const existingOnes = Object.values(menuRoot.value.allItems ?? {}).filter(item => item.t === 'i');
    const lbl = search ? search : `New item ${existingOnes.length + 1}`;
    const parentItemId = currentItem?.value?.id;
    const newItemId = createNewItem('i', { lbl }, parentItemId);
    setTimeout(() => {
        previewItem(newItemId)
    }, 500)
}
</script>
<template>
    <div class="category-container border rounded-lg mb-12 bg-background"
         v-if="currentItem">
        <div class="flex justify-between items-center border-b border-muted-foreground p-2 ">
            <div class="text-2xl font-bold flex-1">
                <InputInline v-model="currentItem.lbl">
                    <template #trigger>
                        <span class="text-2xl font-bold h-10 focus:ring-0 border-none capitalize cursor-text">
                            {{ currentItem.lbl || 'Name:' }}
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
            <draggable v-model="currentItem.cIds"
                       item-key="id"
                       group="category-items"
                       handle=".item-drag-handle"
                       class="grid grid-cols-1 gap-6 lg:grid-cols-2  p-2 my-4">
                class="grid grid-cols-1 gap-6 lg:grid-cols-2 p-2 my-4">
                <template #item="{ element: itemId }">
                    <ItemCard :itemId="itemId"
                              :categoryId="currentItem.id" />
                </template>
            </draggable>
            <div class="p-2">
                <SelectWithSearch :items="Object.values(menuRoot.allItems ?? {})
                    .filter(item => item.t !== 'ct')
                    .map(item => ({
                        key: item.id,
                        name: item.lbl
                    }))"
                                  @select="(selectedItem) => {
                                    addChildItem(currentItem?.id, selectedItem.key)
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