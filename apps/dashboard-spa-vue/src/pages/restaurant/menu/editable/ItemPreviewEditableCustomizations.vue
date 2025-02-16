<script setup lang="ts">
import { menuRoot } from "../store";
import { Item, type BucketItem } from "lib/types/menuType";
import { onMounted, ref } from "vue";
import ItemPreviewCustomizationCard from "./ItemPreviewCustomizationCard.vue";
import { Button } from "@/components/ui/button";
import draggable from "vuedraggable";
import { ChevronUpSquare, ListTodo, Plus } from "lucide-vue-next";
import { addChildItem, createNewItem } from "../helpers";
import SelectWithSearch from "@/ui-plus/SelectWithSearch/SelectWithSearch.vue";

const props = defineProps<{
    currentItem?: Item,
    bucketItem?: BucketItem
}>()

const isCollapsed = ref(false);

onMounted(() => {
    setTimeout(() => {
        if (props.currentItem?.children) {
            isCollapsed.value = props.currentItem?.children?.length === 0
        } else {
            isCollapsed.value = true;
        }
    })
})

const unlink = (index: number) => {
    if (!confirm('Are you sure?')) {
        return;
    }
    if (props.currentItem?.children) {
        props.currentItem?.children.splice(index, 1)
        if (props.currentItem?.children.length === 0) {
            props.currentItem.children = undefined
        }
    }
}

const onClickAddNewCustomization = (search: string | undefined) => {
    const childLen = (props.currentItem?.children || [])?.length;
    const itemLabel = search ? search.trim() : `Customize ${props.currentItem?.itemLabel} ` +
        `${childLen === 0 ? '' : `(${childLen + 1})`}`;
    const parentItemId = props.currentItem?.itemId;
    // const newItemId =
    createNewItem('customization', { itemLabel, maxQuantity: 1, minQuantity: 1 }, parentItemId);
    // setTimeout(() => {
    // editCustomization(newItemId)
    // }, 500)
}



</script>

<template>
    <div v-if="currentItem"
         class="mt-8">
        <div v-if="currentItem">
            <Button variant="outline"
                    class="w-full"
                    v-if="isCollapsed"
                    @click="isCollapsed = false">
                <ListTodo /> Customizations
            </Button>
            <div v-else
                 class="border rounded-lg p-1 sm:p-4">

                <div class="flex justify-between items-center mb-4 gap-2">
                    <Button variant="ghost"
                            @click="isCollapsed = true">
                        Customizations
                        <ChevronUpSquare />
                    </Button>
                    <SelectWithSearch :items="Object.values(menuRoot.allItems ?? {})
                        .filter(item => item.type === 'customization')
                        .map(item => ({
                            key: item.itemId,
                            name: item.itemLabel
                        }))"
                                      @select="(item) => {
                                        addChildItem(currentItem?.itemId, item.key)
                                    }"
                                      @create-new="onClickAddNewCustomization"
                                      :has-new-button="true"
                                      heading="Link an existing item">
                        <template #trigger>
                            <Button variant="outline">
                                <Plus />
                            </Button>
                        </template>
                    </SelectWithSearch>
                </div>
                <draggable v-model="currentItem.children"
                           item-key="itemId"
                           group="customization-items"
                           handle=".customization-drag-handle"
                           class="space-y-2">
                    <template #item="{ element: child, index }">
                        <ItemPreviewCustomizationCard v-if="bucketItem?.childrenState"
                                                      :parent-item-id="currentItem?.itemId"
                                                      :itemId="child"
                                                      @unlink="() => {
                                                        unlink(index)
                                                    }"
                                                      :is-draggable="true"
                                                      v-model="bucketItem.childrenState[index]" />
                    </template>
                </draggable>
            </div>
        </div>

        <!-- {{ menu2Store.allItems?.[child]?.itemLabel }} -->
        <!-- <div v-for="(child, index) in currentItem?.children"
                     :key="child">
                    <ItemPreviewCustomizationCard v-if="bucketItem.childrenState"
                                                          :itemId="child"
                                                          v-model="bucketItem.childrenState[index]" />
                </div> -->
    </div>
</template>