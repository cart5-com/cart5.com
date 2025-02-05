<script lang="ts" setup>
import {
    Dialog,
    DialogScrollContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog"
import { type Item } from "lib/types/menuTypes"
import { ref } from "vue"
import { Eye, RefreshCcw } from "lucide-vue-next"
import { menuJSON } from "../store"
import OptionGroupPreview from "./OptionGroupPreview.vue"

const props = defineProps<{
    item?: Item
}>()

const selectedSizeId = ref<string | null>(null);


const resetAll = () => {
    selectedSizeId.value = null;
    if (props.item && props.item.itemSizes && props.item.itemSizes.length > 0) {
        const size = props.item.itemSizes?.find(s => s.preSelected);
        if (size && size.itemSizeId) {
            selectedSizeId.value = size.itemSizeId;
        }
        if (!size && props.item.itemSizes[0].itemSizeId) {
            selectedSizeId.value = props.item.itemSizes[0].itemSizeId;
        }
    }
}

const setSelectedSizeId = (sizeId: string | undefined) => {
    if (sizeId) {
        selectedSizeId.value = sizeId;
    } else {
        selectedSizeId.value = null;
    }
}

const isOpen = ref(false)
defineExpose({ isOpen, resetAll })

</script>

<template>
    <Dialog v-model:open="isOpen">
        <DialogScrollContent>
            <DialogHeader>
                <DialogTitle class="flex items-center gap-2">
                    <Eye />
                    <RefreshCcw class="cursor-pointer"
                                @click="resetAll" />
                    Preview: {{ item?.itemLabel }}
                </DialogTitle>
                <DialogDescription>
                    Description: {{ item?.description }}
                </DialogDescription>
            </DialogHeader>
            <div v-if="item?.itemSizes">
                <div v-for="size in item.itemSizes"
                     :class="[
                        'cursor-pointer transition-colors p-1 capitalize line-clamp-1 overflow-hidden border bg-card rounded-md my-1',
                        selectedSizeId === size.itemSizeId ? 'bg-primary text-primary-foreground border-primary' : ''
                    ]"
                     :key="size.itemSizeId"
                     @click="setSelectedSizeId(size.itemSizeId)">
                    <div class="flex justify-between gap-1">
                        <span class="text-sm">
                            {{ size.itemSizeLabel }}
                        </span>
                        <span class="text-xs">
                            ${{ size.price }}
                        </span>
                    </div>
                </div>
            </div>

            <div v-if="item?.optionGroupIds">
                <div v-for="optionGroupId in item.optionGroupIds"
                     :key="optionGroupId">
                    <span class="text-sm">
                        optionGroupId:{{ optionGroupId }}
                    </span>
                </div>
            </div>

            <!-- list selected size's optionGroupIds -->
            <div v-if="selectedSizeId">
                <div v-for="optionGroupId in item.itemSizes?.find(s => s.itemSizeId === selectedSizeId)?.optionGroupIds"
                     :key="optionGroupId">
                    <span class="text-sm">
                        <OptionGroupPreview :optionGroup="menuJSON.allOptionGroups?.[optionGroupId]" />
                    </span>
                </div>
            </div>
        </DialogScrollContent>
    </Dialog>
</template>