<script lang="ts" setup>
import { type ItemId } from "@lib/zod/menuRootSchema";
import { type CartItem } from "@lib/zod/cartItemState";
import { calculateCartItemPrice } from "@lib/utils/calculateCartItemPrice";
import { roundTo2Decimals } from "@lib/utils/roundTo2Decimals";
import { computed, ref, watch, onMounted } from "vue";
import { toast } from "@/ui-plus/sonner";
import {
    NumberField,
    NumberFieldContent,
    NumberFieldDecrement,
    NumberFieldIncrement,
    NumberFieldInput,
} from '@/components/ui/number-field'
import { Button } from "@/components/ui/button";
import ItemHeader from "./ItemHeader.vue";
import ItemCustomizations from "./ItemCustomizations.vue";
import type { TaxSettings } from "@lib/zod/taxSchema";

const props = defineProps<{
    itemId?: ItemId,
    cartItem?: CartItem,
    isEdit?: boolean
}>()

const currentItem = computed(() => {
    if (props.itemId) {
        return window.storeData?.menu?.menuRoot?.allItems?.[props.itemId]
    }
    return undefined
})

const cartItem = ref<CartItem>(props.cartItem || {
    itemId: props.itemId!,
    quantity: 1,
    childrenState: [],
})

const cartItemTotalPrice = ref(0);
let taxSettings = window.storeData?.taxSettings as TaxSettings;

watch([cartItem, currentItem], () => {
    cartItemTotalPrice.value = roundTo2Decimals(calculateCartItemPrice(cartItem.value, window.storeData?.menu?.menuRoot!, taxSettings, window.orderType).itemPrice)
}, { deep: true })

onMounted(() => {
    cartItemTotalPrice.value = roundTo2Decimals(calculateCartItemPrice(cartItem.value, window.storeData?.menu?.menuRoot!, taxSettings, window.orderType).itemPrice)
})


const randomNumber = crypto.randomUUID()
const checkCartItem = () => {
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
                }, 1000)
            }, 1000)
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
            <ItemHeader :current-item="currentItem" />
            <!-- <ItemPreviewEditableHeader :current-item="currentItem" /> -->
            <div :class="`warning-container-${randomNumber}`">
                <ItemCustomizations :current-item="currentItem"
                                    :cartItem="cartItem" />
            </div>
            <NumberField id="quantity"
                         class="max-w-40 mt-8"
                         v-model="cartItem.quantity!"
                         :default-value="1"
                         :step="1"
                         :min="1">
                <NumberFieldContent>
                    <NumberFieldDecrement class="bg-secondary rounded-l-md hover:bg-secondary/60 cursor-pointer" />
                    <NumberFieldInput />
                    <NumberFieldIncrement class="bg-secondary rounded-r-md hover:bg-secondary/60 cursor-pointer" />
                </NumberFieldContent>
            </NumberField>
            <Button class="w-full mt-8"
                    @click="() => {
                        if (checkCartItem()) {
                            $emit('close', JSON.parse(JSON.stringify(cartItem)))
                        } else {
                            toast.error('Please select required options')
                        }
                    }">
                <template v-if="isEdit">
                    Update
                </template>
                <template v-else>
                    Add {{ cartItem.quantity }} to cart
                </template>
            </Button>
        </div>
        <div
             class="sticky bottom-0 rounded-md bg-background w-full flex flex-col justify-between gap-2 items-center font-bold">
            Total: {{ cartItemTotalPrice }}
            <!-- <details>
                <summary>cartItem</summary>
                <pre>{{ cartItem }}</pre>
            </details> -->
        </div>
    </div>
</template>