<script lang="ts" setup>
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog"
import { type BucketItem } from "lib/types/menuTypes"
import { computed, onMounted, ref } from "vue"
import { Eye } from "lucide-vue-next"
import { menuJSON } from "../../store"
import OptionGroupPreview from "./OptionGroupPreview.vue"
import ItemPreviewSizes from "./ItemPreviewSizes.vue"

const isDev = import.meta.env.DEV;

const props = defineProps<{
    itemId?: string
}>()

const currentItem = computed(() =>
    props.itemId ? menuJSON.value?.allItems?.[props.itemId] : undefined
);

const defaultBucketItem: BucketItem = {
    quantity: 1,
    selectedItemId: props.itemId,
    selectedSizeId: undefined,
    selectedItem_optionGroupIds: [],
    selectedSize_optionGroupIds: [],
}
const bucketItem = ref<BucketItem>(JSON.parse(JSON.stringify(defaultBucketItem)));

const currentItemSize = computed(() => {
    if (props.itemId) {
        return currentItem.value?.itemSizes?.find(s => s.itemSizeId === bucketItem.value.selectedSizeId);
    }
    return undefined;
})

const resetAll = () => {
    bucketItem.value = JSON.parse(JSON.stringify(defaultBucketItem));
    console.log('resetAll', props.itemId);
    if (props.itemId) {
        // set preSelected as selectedSizeId or first size if no preSelected
        const size = currentItem.value?.itemSizes?.find(s => s.preSelected);
        if (size && size.itemSizeId) {
            bucketItem.value.selectedSizeId = size.itemSizeId;
        }
        if (!size && currentItem.value?.itemSizes?.[0]?.itemSizeId) {
            bucketItem.value.selectedSizeId = currentItem.value?.itemSizes?.[0]?.itemSizeId;
        }
    }
}

onMounted(() => {
    setTimeout(() => {
        resetAll();
    });
})

const isOpen = ref(false);
defineExpose({ isOpen, resetAll })

</script>

<template>
    <Dialog v-model:open="isOpen"
            v-if="currentItem && itemId">
        <DialogContent class="p-2 sm:p-4">
            <DialogHeader>
                <DialogTitle class="flex items-center gap-2">
                    <Eye />
                    Preview: {{ currentItem?.itemLabel }}
                </DialogTitle>
            </DialogHeader>

            <div class="overflow-y-auto max-h-[90dvh]">
                <div class="text-sm">
                    Description: {{ currentItem?.description }}
                </div>
                <ItemPreviewSizes :itemId="itemId"
                                  :bucketItem="bucketItem" />

                <div v-if="currentItem?.optionGroupIds"
                     class="my-2 py-2">
                    <div v-for="(optionGroupId, index) in currentItem?.optionGroupIds"
                         :key="optionGroupId">
                        <span class="text-sm">
                            <!-- optionGroupId:{{ optionGroupId }} -->
                            <OptionGroupPreview v-if="bucketItem.selectedItem_optionGroupIds"
                                                :optionGroupId="optionGroupId"
                                                v-model="bucketItem.selectedItem_optionGroupIds[index]" />
                        </span>
                    </div>
                </div>

                <!-- list selected size's optionGroupIds -->
                <div v-if="bucketItem.selectedSizeId">
                    <div v-for="(optionGroupId, index) in currentItemSize?.optionGroupIds"
                         :key="optionGroupId">
                        <span class="text-sm">
                            <!-- itemSize-optionGroupId:{{ optionGroupId }} -->
                            <OptionGroupPreview v-if="bucketItem.selectedSize_optionGroupIds"
                                                :optionGroupId="optionGroupId"
                                                v-model="bucketItem.selectedSize_optionGroupIds[index]" />
                        </span>
                    </div>
                </div>
                <div v-if="isDev">
                    <details>
                        <summary>bucketItem</summary>
                        <pre>{{ bucketItem }}</pre>
                    </details>
                </div>
            </div>



        </DialogContent>
    </Dialog>
</template>