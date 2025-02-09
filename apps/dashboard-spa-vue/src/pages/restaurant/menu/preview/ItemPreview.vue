<script setup lang="ts">
import { menuRoot } from "../store";
import { type BucketItem, type ItemId } from "lib/types/menuType";
import { computed, ref } from "vue";
import ItemPreviewRecursiveChildren from "./ItemPreviewRecursiveChildren.vue";
import { Button } from "@/components/ui/button";
import { toast } from "@/ui-plus/sonner";

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

const randomNumber = crypto.randomUUID()

const checkBucketItem = () => {
    // count .min-quantity-warning classes inside .warning-container-${randomNumber}
    const warningContainer = document.querySelector(`.warning-container-${randomNumber}`)
    const warningCount = warningContainer?.querySelectorAll('.min-quantity-warning').length
    if (warningCount && warningCount > 0) {
        // focus on the first warning
        const firstWarning = warningContainer?.querySelector<HTMLElement>('.min-quantity-warning')
        if (firstWarning) {
            firstWarning.scrollIntoView({ behavior: 'smooth', block: 'center' })
            firstWarning.focus()
            setTimeout(() => {
                firstWarning.parentElement?.classList.add('headShake-animation')
                setTimeout(() => {
                    firstWarning.parentElement?.classList.remove('headShake-animation')
                }, 500)
            }, 500)
        }
        return false
    } else {
        return true;
    }
}

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
            <div :class="`warning-container-${randomNumber}`">
                <div v-for="(child, index) in currentItem?.children"
                     :key="child">
                    <!-- {{ menu2Store.allItems?.[child]?.itemLabel }} -->
                    <ItemPreviewRecursiveChildren v-if="bucketItem.childrenState"
                                                  :itemId="child"
                                                  v-model="bucketItem.childrenState[index]" />
                </div>
            </div>
            <details>
                <summary>bucketItem</summary>
                <pre class="text-xs max-w-full overflow-y-auto">{{ bucketItem }}</pre>
            </details>
        </div>
        <div class="sticky bottom-0 p-2 bg-card">
            <Button class="w-full"
                    @click="() => {
                        if (checkBucketItem()) {
                            $emit('close', bucketItem)
                        } else {
                            toast.error('Please select required options')
                        }
                    }">Add</Button>
        </div>

    </div>
</template>