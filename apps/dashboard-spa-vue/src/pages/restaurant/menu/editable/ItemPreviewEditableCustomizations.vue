<script setup lang="ts">
import { menuRoot } from "../store";
import { Item, type CartItem } from "@lib/types/menuType";
import { onMounted, ref } from "vue";
import ItemPreviewCustomizationCard from "./ItemPreviewCustomizationCard.vue";
import { Button } from "@/components/ui/button";
import draggable from "vuedraggable";
import { ChevronUpSquare, ListTodo, Plus } from "lucide-vue-next";
import { addChildItem, createNewItem } from "../helpers";
import SelectWithSearch from "@/ui-plus/SelectWithSearch/SelectWithSearch.vue";

const props = defineProps<{
    currentItem?: Item,
    cartItem?: CartItem
}>()

const isCollapsed = ref(false);

onMounted(() => {
    setTimeout(() => {
        if (props.currentItem?.cIds) {
            isCollapsed.value = props.currentItem?.cIds?.length === 0
        } else {
            isCollapsed.value = true;
        }
    })
})

const unlink = (index: number) => {
    if (!confirm('Are you sure?')) {
        return;
    }
    if (props.currentItem?.cIds) {
        props.currentItem?.cIds.splice(index, 1)
        if (props.currentItem?.cIds.length === 0) {
            props.currentItem.cIds = undefined
        }
    }
}

const onClickAddNewCustomization = (search: string | undefined) => {
    const childLen = (props.currentItem?.cIds || [])?.length;
    const lbl = search ? search.trim() : `Customize ${props.currentItem?.lbl} ` +
        `${childLen === 0 ? '' : `(${childLen + 1})`}`;
    const parentItemId = props.currentItem?.id;
    // const newItemId =
    createNewItem('c', { lbl, maxQ: 1, minQ: 1 }, parentItemId);
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
                        .filter(item => item.t === 'c')
                        .map(item => ({
                            key: item.id,
                            name: item.lbl
                        }))"
                                      @select="(item) => {
                                        addChildItem(currentItem?.id, item.key)
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
                <draggable v-model="currentItem.cIds"
                           item-key="id"
                           group="customization-items"
                           handle=".customization-drag-handle"
                           class="space-y-2">
                    <template #item="{ element: child, index }">
                        <ItemPreviewCustomizationCard v-if="cartItem?.childrenState"
                                                      :parent-item-id="currentItem?.id"
                                                      :itemId="child"
                                                      @unlink="() => {
                                                        unlink(index)
                                                    }"
                                                      :is-draggable="true"
                                                      v-model="cartItem.childrenState[index]" />
                    </template>
                </draggable>
            </div>
        </div>
    </div>
</template>