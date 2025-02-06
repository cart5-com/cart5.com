<script lang="ts" setup>
import { Dialog, DialogScrollContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { type Item } from "lib/types/menuTypes"
import { onMounted, ref } from "vue"
import ItemPropsDialog from "./ItemPropsDialog.vue"
import draggable from "vuedraggable"
import { Button } from "@/components/ui/button"
import { ChevronDownSquare, ChevronUpSquare, Plus } from "lucide-vue-next"
import ItemSizeCard from "./ItemSizeCard.vue"
import OptionGroupIdsList from "./OptionGroupIdsList.vue"
import { useMenuOperations } from "../composables/useMenuOperations"

const { openItemPreviewDialog } = useMenuOperations()

const isDev = import.meta.env.DEV

const props = defineProps<{
    item?: Item
}>()


const addNewSize = () => {
    if (props.item) {
        if (!props.item.itemSizes) {
            props.item.itemSizes = []
        }
        props.item.itemSizes.push({
            itemSizeId: `size-${Date.now()}`,
            itemSizeLabel: `Size ${props.item.itemSizes.length + 1}`,
            price: props.item.price || 0,
            preSelected: false
        })
    }
}

const makeItemSizePreSelected = (index?: number) => {
    if (props.item?.itemSizes) {
        props.item.itemSizes.forEach(size => {
            size.preSelected = undefined
        })
        if (typeof index === 'number') {
            props.item.itemSizes[index].preSelected = true
        }
    }
}

const removeSize = (index: number) => {
    if (props.item?.itemSizes) {
        props.item.itemSizes.splice(index, 1)
        if (props.item.itemSizes.length === 0) {
            props.item.itemSizes = undefined
        }
    }

}

const isOpen = ref(false);

defineExpose({
    isOpen
})

const isSizesCollapsed = ref(true);
onMounted(() => {
    setTimeout(() => {
        if (
            props.item &&
            props.item.itemSizes &&
            props.item.itemSizes.length > 0
        ) {
            isSizesCollapsed.value = false;
        }
    }, 1000)
})
</script>

<template>
    <Dialog v-model:open="isOpen">
        <DialogScrollContent v-if="item">
            <DialogHeader>
                <DialogTitle>Edit Item</DialogTitle>
            </DialogHeader>
            <div class="grid gap-4 py-4">
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label class="text-right">Name</Label>
                    <Input v-model="item.itemLabel"
                           class="col-span-3" />
                </div>

                <div class="grid grid-cols-4 items-center gap-4">
                    <Label class="text-right">Description</Label>
                    <Textarea v-model="item.description"
                              class="col-span-3"
                              @update:modelValue="(value) => {
                                if (item && value.toString().trim().length === 0) {
                                    item.description = undefined
                                }
                            }" />
                </div>

                <div v-if="!item.itemSizes || item.itemSizes.length === 0"
                     class="grid grid-cols-4 items-center gap-4">
                    <Label class="text-right">Price</Label>
                    <Input v-model="item.price"
                           type="number"
                           class="col-span-3" />
                </div>

                <!-- <div class="grid grid-cols-4 items-center gap-4">
                    <Label class="text-right">Image URL</Label>
                    <Input v-model="item.imageUrl"
                           class="col-span-3" />
                </div> -->



                <div v-if="isSizesCollapsed">
                    <Button variant="outline"
                            class="w-full"
                            v-if="item && item.itemSizes && item.itemSizes.length > 0"
                            @click="isSizesCollapsed = false">
                        <ChevronDownSquare />
                        Show Sizes
                    </Button>
                    <Button v-else
                            variant="outline"
                            class="w-full"
                            @click="() => {
                                addNewSize()
                                isSizesCollapsed = false
                            }">
                        <Plus /> Add Size
                    </Button>
                </div>
                <div v-else
                     class="border rounded-lg p-4">
                    <div class="flex justify-between items-center mb-4">
                        <Button variant="ghost"
                                @click="isSizesCollapsed = true">
                            Sizes
                            <ChevronUpSquare />
                        </Button>
                        <Button variant="outline"
                                size="sm"
                                @click="addNewSize">
                            <Plus class="w-4 h-4 mr-2" /> Add Size
                        </Button>
                    </div>

                    <draggable v-if="item && item.itemSizes"
                               v-model="item.itemSizes"
                               item-key="itemSizeId"
                               group="sizes"
                               handle=".size-drag-handle"
                               class="space-y-4">
                        <template #item="{ element: size, index }">
                            <ItemSizeCard :size="size"
                                          @removeSize="removeSize(index)"
                                          @makePreSelected="makeItemSizePreSelected(index)" />
                        </template>
                    </draggable>
                </div>

                <OptionGroupIdsList :item="item" />

                <ItemPropsDialog :item="item" />

                <Button variant="outline"
                        v-if="item && item.itemId"
                        @click="openItemPreviewDialog(item.itemId)">
                    Preview Item
                </Button>


            </div>

            <details class="mt-4"
                     v-if="isDev">
                <summary>Debug: Item JSON</summary>
                <pre class="text-xs">{{ item }}</pre>
            </details>
        </DialogScrollContent>
    </Dialog>
</template>

<style scoped>
.sortable-chosen {
    border: 1px dashed rgba(var(--primary));
}

.sortable-ghost {
    opacity: 0.5;
    border: 1px dashed rgba(var(--secondary));
}
</style>