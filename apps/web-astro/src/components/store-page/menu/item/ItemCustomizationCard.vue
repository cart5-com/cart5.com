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
    deep: true,
})

const currentItem = computed(() => {
    if (props.itemId) {
        return window.storeData?.menu?.menuRoot?.allItems?.[props.itemId]
    }
    return undefined
})

const getTotalQuantity = () => {
    const itemState = JSON.parse(JSON.stringify(modelValue.value?.childrenState || [])) as CartChildrenItemState['childrenState']
    return itemState!
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

        <Badge v-if="!isMinQuantityAdded()"
               variant="destructive"
               class="inline-block min-quantity-warning">
            Required
        </Badge>
        <Badge v-else-if="currentItem?.minQ && currentItem?.minQ > 0"
               variant="outline"
               class="inline-block">
            ✅Required
        </Badge>
        <Badge variant="outline"
               class="inline-block">
            Selected:{{ getTotalQuantity() }}
        </Badge>

        <div v-if="helperText"
             class="text-xl font-bold block">
            {{ helperText }}
        </div>

        <span class="capitalize cursor-text text-lg block">
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
