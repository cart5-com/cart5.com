<script lang="ts" setup>
import ItemCustomizationCard from './ItemCustomizationCard.vue';
import { type ItemId } from '@lib/zod/menuRootSchema';
import { type CartChildrenItemState } from '@lib/zod/cartItemState';
import { computed } from 'vue';
import { useVModel } from '@vueuse/core'

const props = defineProps<{
    modelValue?: CartChildrenItemState
    itemId?: ItemId
}>()

const currentItem = computed(() => {
    if (props.itemId) {
        return window.storeData?.menu?.menuRoot?.allItems?.[props.itemId]
    }
    return undefined
})

const emits = defineEmits<{
    (e: 'update:modelValue', payload: CartChildrenItemState): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
    passive: true,
    defaultValue: {
        itemId: props.itemId!,
        childrenState: [],
    },
    deep: props.modelValue ? false : true,
})


const updateNestedOptionGroup = (
    _optionId: string,
    optionIndex: number,
    quantityIndex: number,
    linkIndex: number,
    newValue: CartChildrenItemState
) => {
    if (modelValue.value?.childrenState?.[optionIndex]?.childrenState?.[quantityIndex]) {
        modelValue.value.childrenState[optionIndex].childrenState[quantityIndex][linkIndex] = newValue;
    }
}

function getHelperText(optionItemIndex: number, quantityRepeated: number, optionItemId: ItemId) {
    return modelValue.value?.
        childrenState?.[optionItemIndex]?.quantity! > 1 ?
        `(${quantityRepeated}/${modelValue.value?.childrenState?.[optionItemIndex]?.quantity}) ${window.storeData?.menu?.menuRoot?.allItems?.[optionItemId]?.lbl}` :
        window.storeData?.menu?.menuRoot?.allItems?.[optionItemId]?.lbl
}

const menuRoot = window.storeData?.menu?.menuRoot;
</script>
<template>
    <div v-if="currentItem?.cIds && menuRoot"
         v-for="(optionItemId, optionItemIndex) in currentItem?.cIds"
         :key="optionItemId">
        <div v-if="menuRoot.allItems?.[optionItemId]?.cIds">
            <template v-for="quantityRepeated in modelValue?.childrenState?.[optionItemIndex]?.quantity"
                      :key="`${optionItemId}-${quantityRepeated}`">
                <div class="py-2 my-8">
                    <div v-for="(childItemId, index) in menuRoot.allItems?.[optionItemId]?.cIds"
                         :key="`${childItemId}-${quantityRepeated}-${index}`">
                        <div v-if="childItemId">
                            <ItemCustomizationCard :model-value="modelValue?.childrenState?.[optionItemIndex]?.childrenState?.[quantityRepeated - 1]?.[index]!"
                                                   @update:model-value="updateNestedOptionGroup(optionItemId, optionItemIndex, quantityRepeated - 1, index, $event)"
                                                   :item-id="childItemId"
                                                   :helper-text="getHelperText(optionItemIndex, quantityRepeated, optionItemId)!"
                                                   :parent-item-id="optionItemId" />
                        </div>
                    </div>


                </div>
            </template>
        </div>
    </div>
</template>