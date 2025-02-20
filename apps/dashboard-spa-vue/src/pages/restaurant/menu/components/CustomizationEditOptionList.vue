<script lang="ts" setup>
import { Button } from "@/components/ui/button";
import { menuRoot } from "../store";
import { ItemId } from "lib/types/menuType";
import { AlignJustify, Link2Off, Plus } from "lucide-vue-next";
import { computed } from "vue";
import draggable from "vuedraggable";
import SelectWithSearch from "@/ui-plus/SelectWithSearch/SelectWithSearch.vue";
import { addChildItem, createNewItem } from "../helpers";
import { Input } from "@/components/ui/input";

const props = defineProps<{
    itemId: ItemId
}>()

const currentItem = computed(() => {
    return menuRoot.value.allItems?.[props.itemId]
})


const unlink = (index: number) => {
    if (currentItem.value?.cIds) {
        currentItem.value.cIds.splice(index, 1)
        if (currentItem.value.cIds.length === 0) {
            currentItem.value.cIds = undefined
        }
    }
}

const onClickAddNewOption = (search: string | undefined) => {
    const childLen = (currentItem?.value?.cIds || [])?.length;
    const lbl = search ? search : `Option ${childLen === 0 ? '' : `(${childLen + 1})`}`;
    createNewItem('o', { lbl }, currentItem?.value?.id);
}
</script>

<template>
    <div v-if="currentItem"
         class="border rounded-lg p-4">
        <div class="flex justify-between items-center mb-4 gap-2">
            <Button variant="ghost">
                Available Options
            </Button>
            <SelectWithSearch :items="Object.values(menuRoot.allItems ?? {})
                .filter(item => {
                    // itself not allowed
                    if (currentItem?.id === item.id) {
                        return false
                    }
                    // parent is not allowed
                    if (item.cIds?.includes(currentItem?.id ?? '')) {
                        return false
                    }
                    return true
                })
                .map(item => ({
                    key: item.id,
                    name: item.lbl
                }))"
                              @select="(item) => {
                                addChildItem(currentItem?.id, item.key)
                            }"
                              @create-new="onClickAddNewOption"
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
                   group="option-items"
                   handle=".option-drag-handle"
                   class="space-y-2">
            <template #item="{ element: itemId, index }">
                <div>
                    <div class="flex items-center justify-between bg-muted p-2 rounded-md">
                        <div class="text-sm line-clamp-1 flex-1 mr-2 p-1"
                             v-if="menuRoot.allItems">
                            <Input class="capitalize"
                                   v-model="menuRoot.allItems[itemId].lbl" />
                            <Input type="number"
                                   placeholder="Price - / +"
                                   :model-value="menuRoot.allItems[itemId!].opPrc"
                                   @update:model-value="(value) => {
                                    if (!menuRoot.allItems) return;
                                    if (value) {
                                        menuRoot.allItems[itemId!].opPrc = Number(value)
                                    } else {
                                        delete menuRoot.allItems?.[itemId!].opPrc;
                                    }
                                }" />
                        </div>
                        <div class="flex flex-wrap items-center gap-2">
                            <div class="flex flex-col">
                                <!-- <Button variant="ghost"
                                    @click="() => {
                                        // editCustomization(itemId)
                                    }"
                                    size="sm">
                                <Pencil class="w-4 h-4" />
                            </Button> -->
                                <Button variant="destructive"
                                        @click="unlink(index)"
                                        size="sm">
                                    <Link2Off class="w-4 h-4" />
                                </Button>
                            </div>
                            <AlignJustify class="option-drag-handle w-5 h-5 cursor-move text-muted-foreground" />
                        </div>
                    </div>
                    <details>
                        <summary>currentItem</summary>
                        <pre class="text-xs max-w-full overflow-y-auto">{{ menuRoot.allItems?.[itemId] }}</pre>
                    </details>
                </div>
            </template>
        </draggable>
        <details class="mt-8 border-t">
            <summary>currentItem</summary>
            <pre class="text-xs max-w-full overflow-y-auto">{{ currentItem }}</pre>
        </details>
    </div>
</template>