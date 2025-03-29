<script lang="ts" setup>
import { useVModel } from '@vueuse/core'
import { type CartChildrenItemState, type ItemId } from "@lib/types/menuType";
import { computed } from 'vue';
import { CornerDownRight } from 'lucide-vue-next';
import { Badge } from '@/components/ui/badge';
import RecursiveCustomizations from './RecursiveCustomizations.vue';
import ItemCustomizationOptions from './ItemCustomizationOptions.vue';

const props = defineProps<{
    modelValue?: CartChildrenItemState
    itemId?: ItemId
    helperText?: string
    parentItemId?: ItemId
}>()

const emits = defineEmits<{
    (e: 'update:modelValue', payload: CartChildrenItemState): void
    (e: 'unlink'): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
    passive: true,
    defaultValue: {
        itemId: props.itemId!,
        childrenState: [],
    },
    deep: props.modelValue ? false : true,
})

const currentItem = computed(() => {
    if (props.itemId) {
        return window.menuRoot.allItems?.[props.itemId]
    }
    return undefined
})

const getTotalQuantity = () => {
    return Object.values(modelValue.value?.childrenState || {})
        .filter(item => item !== null && item !== undefined)
        .reduce((acc, curr) => acc + (curr?.quantity || 0), 0);
}

const isMinQuantityAdded = () => {
    if (currentItem.value?.minQ && currentItem.value?.minQ > 0) {
        return getTotalQuantity() >= currentItem.value?.minQ;
    }
    return true;
}

</script>

<template>
    <div class="border-t py-1 sm:py-4 mb-12 border-card-foreground"
         v-if="currentItem">

        <div v-if="!isMinQuantityAdded()"
             class="text-xs font-bold rounded-md bg-destructive text-destructive-foreground p-1 min-quantity-warning mb-2 w-fit">
            Required
        </div>
        <div v-else-if="currentItem?.minQ && currentItem?.minQ > 0"
             class="text-xs font-bold rounded-md bg-secondary text-secondary-foreground p-1 mb-2 w-fit">
            ✅Required
        </div>

        <div v-if="helperText"
             class="text-xl font-bold">
            {{ helperText }}
        </div>

        <span class="capitalize cursor-text text-lg">
            <CornerDownRight v-if="helperText"
                             class="inline-block" />
            {{ currentItem?.lbl || '' }}
        </span>



        <div class="text-xs flex flex-col gap-2 items-start my-2">
            <Badge variant="outline">
                Choose min:
                {{ (currentItem?.minQ === 0 || !currentItem?.minQ) ? 'optional' : currentItem?.minQ }}
            </Badge>
            <Badge variant="outline">
                Choose up to:
                {{ (currentItem?.maxQ === 0 || !currentItem?.maxQ) ? 'unlimited' : currentItem?.maxQ }}
            </Badge>
        </div>

        <ItemCustomizationOptions v-model="modelValue!"
                                  :item-id="itemId!" />

        <RecursiveCustomizations v-model="modelValue!"
                                 :item-id="itemId!" />

    </div>
</template>
