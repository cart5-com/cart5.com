<script lang="ts" setup>
import { Button } from "@/components/ui/button";
import { menuRoot } from "@src/pages/restaurant/menu/store";
import { ItemId } from "lib/types/menuType";
import { AlignJustify, Link2Off, Plus } from "lucide-vue-next";
import { computed } from "vue";
import draggable from "vuedraggable";
import SelectWithSearch from "@/ui-plus/SelectWithSearch/SelectWithSearch.vue";
import { addChildItem, createNewItem } from "../../helpers";
import { Input } from "@/components/ui/input";

const props = defineProps<{
    itemId: ItemId
}>()

const currentItem = computed(() => {
    return menuRoot.value.allItems?.[props.itemId]
})


const unlink = (index: number) => {
    if (currentItem.value?.children) {
        currentItem.value.children.splice(index, 1)
        if (currentItem.value.children.length === 0) {
            currentItem.value.children = undefined
        }
    }
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
                    if (currentItem?.itemId === item.itemId) {
                        return false
                    }
                    // parent is not allowed
                    if (item.children?.includes(currentItem?.itemId ?? '')) {
                        return false
                    }
                    return true
                })
                .map(item => ({
                    key: item.itemId,
                    name: item.itemLabel
                }))"
                              @select="(item) => {
                                addChildItem(currentItem?.itemId, item.key)
                            }"
                              @create-new="(search) => {
                                createNewItem(search, currentItem?.itemId, 'New option')
                            }"
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
                   group="option-items"
                   handle=".option-drag-handle"
                   class="space-y-2">
            <template #item="{ element: itemId, index }">
                <div>
                    <div class="flex items-center justify-between bg-muted p-2 rounded-md">
                        <div class="text-sm line-clamp-1 flex-1 mr-2 p-1"
                             v-if="menuRoot.allItems">
                            <Input v-model="menuRoot.allItems[itemId].itemLabel" />
                            <Input type="number"
                                   placeholder="Price - / +"
                                   :model-value="menuRoot.allItems[itemId].priceOverrides?.[currentItem?.itemId!]"
                                   @update:model-value="(value) => {
                                    if (!menuRoot.allItems) return;
                                    if (value) {
                                        if (!menuRoot.allItems[itemId].priceOverrides) {
                                            menuRoot.allItems[itemId].priceOverrides = {}
                                        }
                                        menuRoot.allItems[itemId].priceOverrides[currentItem?.itemId!] = Number(value)
                                    } else {
                                        delete menuRoot.allItems?.[itemId]?.priceOverrides?.[currentItem?.itemId!]
                                        if (Object.keys(menuRoot.allItems[itemId].priceOverrides ?? {}).length === 0) {
                                            menuRoot.allItems[itemId].priceOverrides = undefined
                                        }
                                    }
                                }" />
                        </div>
                        <div class="flex flex-wrap items-center gap-2">
                            <div class="flex flex-col">
                                <!-- <Button variant="ghost"
                                    @click="() => {
                                        // editOptionSet(itemId)
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