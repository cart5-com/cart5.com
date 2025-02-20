<script lang="ts" setup>
import { Button } from "@/components/ui/button";
import { menuRoot } from "../store";
import { ItemId } from "lib/types/menuType";
import { AlignJustify, ChevronUpSquare, Link2Off, ListTodo, Pencil, Plus } from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";
import draggable from "vuedraggable";
import SelectWithSearch from "@/ui-plus/SelectWithSearch/SelectWithSearch.vue";
import { addChildItem, createNewItem, editCustomization } from "../helpers";

const props = defineProps<{
    itemId: ItemId
}>()

const currentItem = computed(() => {
    return menuRoot.value.allItems?.[props.itemId]
})

const isCollapsed = ref(false);
onMounted(() => {
    setTimeout(() => {
        if (currentItem.value?.children) {
            isCollapsed.value = currentItem.value?.children?.length === 0
        } else {
            isCollapsed.value = true;
        }
    })
})

const unlink = (index: number) => {
    if (currentItem.value?.children) {
        currentItem.value.children.splice(index, 1)
        if (currentItem.value.children.length === 0) {
            currentItem.value.children = undefined
        }
    }
}

const onClickAddNewCustomization = (search: string | undefined) => {
    const childLen = (currentItem?.value?.children || [])?.length;
    const lbl = search ? search.trim() : `Customize ${currentItem?.value?.lbl} ` +
        `${childLen === 0 ? '' : `(${childLen + 1})`}`;
    const parentItemId = currentItem?.value?.id;
    const newItemId = createNewItem('customization', { lbl, maxQuantity: 1, minQuantity: 0 }, parentItemId);
    setTimeout(() => {
        editCustomization(newItemId)
    }, 500)
}
</script>

<template>
    <div v-if="currentItem">
        <Button variant="outline"
                class="w-full"
                v-if="isCollapsed"
                @click="isCollapsed = false">
            <ListTodo /> Customizations
        </Button>
        <div v-else
             class="border rounded-lg p-4">

            <div class="flex justify-between items-center mb-4 gap-2">
                <Button variant="ghost"
                        @click="isCollapsed = true">
                    Customizations
                    <ChevronUpSquare />
                </Button>
                <SelectWithSearch :items="Object.values(menuRoot.allItems ?? {})
                    // .filter(item => item.type !== 'category' && item.type !== 'option' && item.itemId !== currentItem?.itemId)
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
            <draggable v-model="currentItem.children"
                       item-key="id"
                       group="customization-items"
                       handle=".option-drag-handle"
                       class="space-y-2">
                <template #item="{ element: itemId, index }">
                    <div class="flex items-center justify-between bg-muted p-2 rounded-md">
                        <span class="text-sm line-clamp-1 capitalize">
                            {{ menuRoot.allItems?.[itemId]?.lbl }}
                        </span>
                        <div class="flex items-center gap-2">
                            <Button variant="ghost"
                                    @click="() => {
                                        editCustomization(itemId)
                                    }"
                                    size="sm">
                                <Pencil class="w-4 h-4" />
                            </Button>
                            <Button variant="ghost"
                                    @click="unlink(index)"
                                    size="sm">
                                <Link2Off class="w-4 h-4" />
                            </Button>
                            <AlignJustify class="option-drag-handle w-5 h-5 cursor-move text-muted-foreground" />
                        </div>
                    </div>
                </template>
            </draggable>
        </div>
    </div>
</template>