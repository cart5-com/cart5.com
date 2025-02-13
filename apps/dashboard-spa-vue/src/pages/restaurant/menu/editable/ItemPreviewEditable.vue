<script setup lang="ts">
import { menuRoot } from "../store";
import { calculateBucketItemPrice, type BucketItem, type ItemId } from "lib/types/menuType";
import { computed, onMounted, ref, watch } from "vue";
import ItemPreviewEditableCustomizations from "./ItemPreviewEditableCustomizations.vue";
import ItemPreviewEditableHeader from "./ItemPreviewEditableHeader.vue";
import { Button } from "@/components/ui/button";
import { toast } from "@/ui-plus/sonner";
import {
    NumberField,
    NumberFieldContent,
    NumberFieldDecrement,
    NumberFieldIncrement,
    NumberFieldInput,
} from '@/components/ui/number-field'

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

const randomNumber = crypto.randomUUID()

const bucketTotalPrice = ref("");

watch([bucketItem, currentItem], () => {
    bucketTotalPrice.value = calculateBucketItemPrice(bucketItem.value, menuRoot.value)
}, { deep: true })

onMounted(() => {
    bucketTotalPrice.value = calculateBucketItemPrice(bucketItem.value, menuRoot.value)
})

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
            }, 300)
        }
        return false
    } else {
        return true;
    }
}

</script>

<template>
    <div class="w-full"
         v-if="currentItem">
        <div class="p-1 sm:p-4">
            <ItemPreviewEditableHeader :current-item="currentItem" />
            <ItemPreviewEditableCustomizations :current-item="currentItem"
                                               :bucket-item="bucketItem" />
            <!-- <details>
                <summary>bucketItem</summary>
                <pre class="text-xs max-w-full overflow-y-auto">{{ bucketItem }}</pre>
            </details> -->
            <NumberField id="quantity"
                         class="max-w-40 mt-8"
                         v-model="bucketItem.quantity"
                         :default-value="1"
                         :step="1"
                         :min="1">
                <NumberFieldContent>
                    <NumberFieldDecrement class="hidden sm:block bg-secondary rounded-l-md hover:bg-secondary/60" />
                    <NumberFieldInput />
                    <NumberFieldIncrement class="hidden sm:block bg-secondary rounded-r-md hover:bg-secondary/60" />
                </NumberFieldContent>
            </NumberField>
            <Button class="w-full mt-8"
                    @click="() => {
                        if (checkBucketItem()) {
                            $emit('close', bucketItem)
                        } else {
                            toast.error('Please select required options')
                        }
                    }">
                Add {{ bucketItem.quantity }} to cart
                <!-- (Total: ${{ bucketTotalPrice }}) -->
            </Button>
        </div>
        <div
             class="sticky bottom-0 rounded-md bg-background w-full flex flex-col justify-between gap-2 items-center font-bold">
            Total: ${{ bucketTotalPrice }}
        </div>

    </div>
</template>