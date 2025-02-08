<script setup lang="ts">
import { menuRoot } from "./store";
import { type BucketItem, type ItemId } from "lib/types/menuType2";
import { computed, ref } from "vue";
import RecursiveChildren from "@src/pages/restaurant/menu2/RecursiveChildren.vue";
import { Button } from "@/components/ui/button";

const props = defineProps<{
    itemId?: ItemId
}>()

const currentItem = computed(() => {
    if (props.itemId) {
        return menuRoot.value.allItems?.[props.itemId]
    }
    return undefined
})


const bucketItem = ref<BucketItem>({
    itemId: props.itemId,
    quantity: 1,
    childrenState: [],
})

</script>

<template>
    <div class="w-full">
        <div class="p-4">
            <div class="sticky top-0 bg-card">
                <div class="text-2xl font-bold">
                    {{ currentItem?.itemLabel }}
                </div>
                <div class="text-sm">
                    ${{ currentItem?.price }}
                </div>
            </div>
            <div v-for="(child, index) in currentItem?.children"
                 :key="child">
                <!-- {{ menu2Store.allItems?.[child]?.itemLabel }} -->
                <RecursiveChildren v-if="bucketItem.childrenState"
                                   :itemId="child"
                                   v-model="bucketItem.childrenState[index]" />
            </div>
            <details>
                <summary>bucketItem</summary>
                <pre class="text-xs max-w-full overflow-y-auto">{{ bucketItem }}</pre>
            </details>
        </div>
        <div class="sticky bottom-0 p-2 bg-card">
            <Button class="w-full"
                    @click="() => {
                        $emit('close', bucketItem)
                    }">Add</Button>
        </div>

    </div>
</template>