<script lang="ts" setup>
import { type ItemId, type MenuRoot, type CartItem, calculateCartItemPrice } from "@lib/types/menuType";
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
const props = defineProps<{
    itemId?: ItemId,
    menuRoot: MenuRoot
}>()

const currentItem = computed(() => {
    if (props.itemId) {
        return props.menuRoot.allItems?.[props.itemId]
    }
    return undefined
})

const cartItem = ref<CartItem>({
    itemId: props.itemId,
    quantity: 1,
    childrenState: [],
})

const cartItemTotalPrice = ref("");

watch([cartItem, currentItem], () => {
    cartItemTotalPrice.value = calculateCartItemPrice(cartItem.value, props.menuRoot)
}, { deep: true })

onMounted(() => {
    cartItemTotalPrice.value = calculateCartItemPrice(cartItem.value, props.menuRoot)
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
                         v-model="cartItem.quantity"
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
                        if (checkCartItem()) {
                            $emit('close', cartItem)
                        } else {
                            toast.error('Please select required options')
                        }
                    }">
                Add {{ cartItem.quantity }} to cart
            </Button>
        </div>
        <div
             class="sticky bottom-0 rounded-md bg-background w-full flex flex-col justify-between gap-2 items-center font-bold">
            Total: ${{ cartItemTotalPrice }}
        </div>

    </div>
</template>