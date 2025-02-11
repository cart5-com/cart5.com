<script lang="ts" setup>
import ItemPreviewRecursiveChildrenEditable from './ItemPreviewRecursiveChildrenEditable.vue';
import { type BucketChildrenState, type ItemId } from 'lib/types/menuType';
import { menuRoot } from '../store';
import { computed } from 'vue';
import { useVModel } from '@vueuse/core'

const props = defineProps<{
    modelValue?: BucketChildrenState
    itemId?: ItemId
}>()

const currentItem = computed(() => {
    if (props.itemId) {
        return menuRoot.value.allItems?.[props.itemId]
    }
    return undefined
})


const emits = defineEmits<{
    (e: 'update:modelValue', payload: BucketChildrenState): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
    passive: true,
    defaultValue: {
        itemId: props.itemId,
        childrenState: [],
    },
    deep: props.modelValue ? false : true,
})


const updateNestedOptionGroup = (
    _optionId: string,
    optionIndex: number,
    quantityIndex: number,
    linkIndex: number,
    newValue: BucketChildrenState
) => {
    if (modelValue.value?.childrenState?.[optionIndex]?.childrenState?.[quantityIndex]) {
        modelValue.value.childrenState[optionIndex].childrenState[quantityIndex][linkIndex] = newValue;
    }
}

</script>
<template>
    <div v-if="currentItem?.children"
         v-for="(optionItemId, optionItemIndex) in currentItem?.children"
         :key="optionItemId">
        <div v-if="menuRoot.allItems?.[optionItemId]?.children">
            <template v-for="quantityRepeated in modelValue?.childrenState?.[optionItemIndex]?.quantity"
                      :key="`${optionItemId}-${quantityRepeated}`">
                <div class="py-2 my-8">
                    <div v-for="(childItemId, index) in menuRoot.allItems?.[optionItemId]?.children"
                         :key="`${childItemId}-${quantityRepeated}-${index}`">
                        <div v-if="childItemId">
                            <ItemPreviewRecursiveChildrenEditable :model-value="modelValue?.childrenState?.[optionItemIndex]?.childrenState?.[quantityRepeated - 1]?.[index]"
                                                                  @update:model-value="updateNestedOptionGroup(optionItemId, optionItemIndex, quantityRepeated - 1, index, $event)"
                                                                  :itemId="childItemId"
                                                                  :helper-text="modelValue?.childrenState?.[optionItemIndex]?.quantity! > 1 ?
                                                                    `(${quantityRepeated}/${modelValue?.childrenState?.[optionItemIndex]?.quantity}) ${menuRoot.allItems?.[optionItemId]?.itemLabel}` :
                                                                    menuRoot.allItems?.[optionItemId]?.itemLabel"
                                                                  @unlink="() => {

                                                                    if (menuRoot.allItems?.[optionItemId]?.children) {
                                                                        menuRoot.allItems?.[optionItemId]?.children.splice(index, 1)
                                                                        if (menuRoot.allItems?.[optionItemId]?.children.length === 0) {
                                                                            menuRoot.allItems[optionItemId].children = undefined
                                                                        }
                                                                    }

                                                                }" />
                        </div>
                    </div>


                </div>
            </template>
        </div>
    </div>
</template>