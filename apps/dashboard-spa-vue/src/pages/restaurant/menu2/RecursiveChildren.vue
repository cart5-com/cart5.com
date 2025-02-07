<script lang="ts" setup>
import { useVModel } from '@vueuse/core'
import { type BucketChildrenState, type ItemId } from "lib/types/menuType2";
import { menu2Store } from "./store";
import { computed } from 'vue';
import { Minus, Plus } from 'lucide-vue-next';

const props = defineProps<{
    modelValue?: BucketChildrenState
    itemId?: ItemId
    helperText?: string
}>()

const emits = defineEmits<{
    (e: 'update:modelValue', payload: BucketChildrenState): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
    passive: true,
    defaultValue: {
        itemId: props.itemId,
        childrenState: {},
    },
    deep: props.modelValue ? false : true,
})

const currentItem = computed(() => {
    if (props.itemId) {
        return menu2Store.value.allItems?.[props.itemId]
    }
    return undefined
})

const addQuantity = (childId: ItemId) => {
    let hasLinkedOptions: boolean = false;
    if (menu2Store.value.allItems?.[childId]?.children) {
        hasLinkedOptions = true;
    }
    if (modelValue.value?.childrenState) {
        if (!modelValue.value.childrenState[childId]) {
            modelValue.value.childrenState[childId] = {
                quantity: 1,
                childrenState: hasLinkedOptions ? [[]] : undefined
            }
        } else {
            if (hasLinkedOptions) {
                modelValue.value.childrenState[childId].childrenState?.push([]);
            }
            if (modelValue.value.childrenState[childId].quantity) {
                modelValue.value.childrenState[childId].quantity++;
            }
        }
    }
}

const removeQuantity = (childId: ItemId) => {
    let hasLinkedOptions: boolean = false;
    if (menu2Store.value.allItems?.[childId]?.children) {
        hasLinkedOptions = true;
    }
    if (modelValue.value?.childrenState) {
        if (modelValue.value.childrenState[childId].quantity) {
            modelValue.value.childrenState[childId].quantity--;
        }
        if (hasLinkedOptions) {
            if (modelValue.value.childrenState[childId].childrenState) {
                modelValue.value.childrenState[childId].childrenState?.pop();
            }
        }
        if (modelValue.value.childrenState[childId].quantity === 0) {
            delete modelValue.value.childrenState[childId];
        }
    }
}

const updateNestedOptionGroup = (
    optionId: string,
    quantityIndex: number,
    linkIndex: number,
    newValue: BucketChildrenState
) => {
    if (modelValue.value?.childrenState?.[optionId]?.childrenState?.[quantityIndex]) {
        modelValue.value.childrenState[optionId].childrenState[quantityIndex][linkIndex] = newValue;
    }
}

const getPrice = (itemId: ItemId) => {
    console.log("props.itemId", props.itemId)
    if (props.itemId) {
        if (menu2Store.value.allItems?.[itemId]?.priceOverrides?.[props.itemId]) {
            return menu2Store.value.allItems?.[itemId]?.priceOverrides?.[props.itemId]
        }
        return menu2Store.value.allItems?.[itemId]?.price
    }
    return undefined;
}

</script>

<template>
    <div class="border rounded-md p-4 my-20">
        <div v-if="helperText">
            {{ helperText }}
        </div>
        <div>
            {{ currentItem?.itemLabel }}
        </div>
        <div class="text-sm"
             v-if="currentItem?.price">
            ${{ currentItem?.price }}
        </div>
        <div v-if="currentItem?.children"
             v-for="optionItemId in currentItem?.children"
             :key="optionItemId">
            <div v-if="menu2Store.allItems?.[optionItemId]">
                <div class="flex justify-between items-center cursor-pointer border rounded-md p-2 hover:bg-accent mt-2"
                     @click="addQuantity(optionItemId)">
                    {{ menu2Store.allItems?.[optionItemId]?.itemLabel }}
                    <span class="text-sm"
                          v-if="getPrice(optionItemId)">
                        ${{ getPrice(optionItemId) }}
                    </span>
                    <Plus class="border border-foreground rounded-md" />
                </div>
                <div class="flex justify-between items-center cursor-pointer border rounded-md p-2 hover:bg-accent mb-2"
                     v-if="modelValue?.childrenState?.[optionItemId]?.quantity! > 0"
                     @click="removeQuantity(optionItemId)">
                    <span class="text-sm">
                        {{ modelValue?.childrenState?.[optionItemId]?.quantity }} x
                    </span>
                    <Minus class="border border-foreground rounded-md" />
                </div>
            </div>
        </div>
        <div v-if="currentItem?.children"
             v-for="optionItemId in currentItem?.children"
             :key="optionItemId">
            <div v-if="menu2Store.allItems?.[optionItemId]?.children">
                <template v-for="quantityRepeated in modelValue?.childrenState?.[optionItemId]?.quantity"
                          :key="`${optionItemId}-${quantityRepeated}`">
                    <div class="py-2 my-8">
                        <div v-for="(childItemId, index) in menu2Store.allItems?.[optionItemId]?.children"
                             :key="`${childItemId}-${quantityRepeated}-${index}`">
                            <div v-if="childItemId">
                                <RecursiveChildren :model-value="modelValue?.childrenState?.[optionItemId]?.childrenState?.[quantityRepeated - 1]?.[index]"
                                                   @update:model-value="updateNestedOptionGroup(optionItemId, quantityRepeated - 1, index, $event)"
                                                   :itemId="childItemId"
                                                   :helper-text="modelValue?.childrenState?.[optionItemId]?.quantity! > 1 ?
                                                    `(${quantityRepeated}/${modelValue?.childrenState?.[optionItemId]?.quantity}) ${menu2Store.allItems?.[optionItemId]?.itemLabel}` :
                                                    menu2Store.allItems?.[optionItemId]?.itemLabel" />
                            </div>
                        </div>


                    </div>
                </template>
            </div>
        </div>
    </div>
</template>
