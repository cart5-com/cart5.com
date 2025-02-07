<script setup lang="ts">
import {
    Dialog,
    DialogScrollContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { menu2Store } from "./store";
import { type BucketItem, type ItemId } from "lib/types/menuType2";
import { computed, onMounted, ref } from "vue";
import RecursiveChildren from "@src/pages/restaurant/menu2/RecursiveChildren.vue";

const props = defineProps<{
    itemId?: ItemId
}>()

const currentItem = computed(() => {
    if (props.itemId) {
        return menu2Store.value.allItems?.[props.itemId]
    }
    return undefined
})

const isOpen = ref(false);

const bucketItem = ref<BucketItem>({
    itemId: props.itemId,
    quantity: 1,
    childrenState: [],
})

const resetBucketItem = () => {
    bucketItem.value = {
        itemId: props.itemId,
        quantity: 1,
        childrenState: [],
    }
}

onMounted(() => {
    setTimeout(() => {
        resetBucketItem();
    }, 1000)
})

defineExpose({
    isOpen, resetBucketItem
})

</script>

<template>
    <Dialog v-model:open="isOpen">
        <DialogScrollContent class="min-w-full">
            <DialogHeader>
                <DialogTitle>
                    {{ currentItem?.itemLabel }}
                </DialogTitle>
                <DialogDescription>
                    ${{ currentItem?.price }}
                </DialogDescription>
            </DialogHeader>
            <div class="flex justify-between w-full">
                <div class="text-sm w-full">
                    <div v-for="(child, index) in currentItem?.children"
                         :key="child">
                        <!-- {{ menu2Store.allItems?.[child]?.itemLabel }} -->
                        <RecursiveChildren v-if="bucketItem.childrenState"
                                           :itemId="child"
                                           v-model="bucketItem.childrenState[index]" />
                    </div>
                </div>
                <details>
                    <summary>bucketItem</summary>
                    <pre class="text-xs max-w-full overflow-y-auto">{{ bucketItem }}</pre>
                </details>
            </div>

        </DialogScrollContent>
    </Dialog>
</template>