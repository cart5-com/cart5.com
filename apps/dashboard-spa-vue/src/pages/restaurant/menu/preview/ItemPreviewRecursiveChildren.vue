<script lang="ts" setup>
import { useVModel } from '@vueuse/core'
import { type BucketChildrenState, type ItemId } from "lib/types/menuType";
import { menuRoot } from "../store";
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
        return menuRoot.value.allItems?.[props.itemId]
    }
    return undefined
})

const getTotalQuantity = () => {
    return Object.values(modelValue.value?.childrenState || {}).reduce((acc, curr) => acc + (curr.quantity || 0), 0);
}

const isMaxQuantity = () => {
    if (currentItem.value?.maxQuantity && currentItem.value?.maxQuantity > 0) {
        return getTotalQuantity() >= currentItem.value?.maxQuantity;
    }
    return false;
}

const isMinQuantityAdded = () => {
    if (currentItem.value?.minQuantity && currentItem.value?.minQuantity > 0) {
        return getTotalQuantity() >= currentItem.value?.minQuantity;
    }
    return true;
}

const addQuantity = (childId: ItemId) => {
    if (isMaxQuantity()) {
        return;
    }
    let hasLinkedOptions: boolean = false;
    if (menuRoot.value.allItems?.[childId]?.children) {
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
    if (menuRoot.value.allItems?.[childId]?.children) {
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
    if (props.itemId) {
        if (menuRoot.value.allItems?.[itemId]?.priceOverrides?.[props.itemId]) {
            return menuRoot.value.allItems?.[itemId]?.priceOverrides?.[props.itemId]
        }
        // return menuRoot.value.allItems?.[itemId]?.price
        return undefined;
    }
    return undefined;
}

</script>

<template>
    <div class="border rounded-md p-4 my-20 bg-accent border-card-foreground">
        <span v-if="!isMinQuantityAdded()"
              class="text-xs font-bold rounded-md bg-destructive text-destructive-foreground p-1 min-quantity-warning">
            Selection Required
        </span>
        <div v-if="helperText"
             class="text-lg font-bold">
            {{ helperText }}
        </div>
        <div class="text-lg font-bold">
            {{ currentItem?.itemLabel }}
        </div>
        <div class="text-xs text-muted-foreground">
            <span v-if="currentItem?.minQuantity && currentItem?.minQuantity > 0">
                Choose {{ currentItem?.minQuantity }}
            </span>
            <span v-if="currentItem?.maxQuantity && currentItem?.maxQuantity > 0">
                (Up to {{ currentItem?.maxQuantity }})
            </span>
        </div>

        <div class="text-xs"
             v-if="currentItem?.price">
            ${{ currentItem?.price }}
        </div>
        <div v-if="currentItem?.children"
             v-for="optionItemId in currentItem?.children"
             :key="optionItemId"
             class="text-sm">
            <div class="border border-card-foreground rounded-md my-2 overflow-hidden">
                <div class="flex justify-between items-center cursor-pointer p-2 bg-card hover:bg-background"
                     :class="[
                        isMaxQuantity() ? 'opacity-40 text-xs   ' : '',
                    ]"
                     @click="addQuantity(optionItemId)">
                    {{ menuRoot.allItems?.[optionItemId]?.itemLabel }}
                    <span v-if="getPrice(optionItemId)">
                        ${{ getPrice(optionItemId) }}
                    </span>
                    <Plus class="border border-foreground rounded-md" />
                </div>
                <div class="flex justify-between items-center cursor-pointer border p-2 bg-card hover:bg-background text-sm font-bold"
                     v-if="modelValue?.childrenState?.[optionItemId]?.quantity! > 0"
                     @click="removeQuantity(optionItemId)">
                    <span>
                        {{ modelValue?.childrenState?.[optionItemId]?.quantity }} x
                        {{ menuRoot.allItems?.[optionItemId]?.itemLabel }}
                    </span>
                    <Minus class="border border-foreground rounded-md" />
                </div>
            </div>
        </div>
        <div v-if="currentItem?.children"
             v-for="optionItemId in currentItem?.children"
             :key="optionItemId">
            <div v-if="menuRoot.allItems?.[optionItemId]?.children">
                <template v-for="quantityRepeated in modelValue?.childrenState?.[optionItemId]?.quantity"
                          :key="`${optionItemId}-${quantityRepeated}`">
                    <div class="py-2 my-8">
                        <div v-for="(childItemId, index) in menuRoot.allItems?.[optionItemId]?.children"
                             :key="`${childItemId}-${quantityRepeated}-${index}`">
                            <div v-if="childItemId">
                                <ItemPreviewRecursiveChildren :model-value="modelValue?.childrenState?.[optionItemId]?.childrenState?.[quantityRepeated - 1]?.[index]"
                                                              @update:model-value="updateNestedOptionGroup(optionItemId, quantityRepeated - 1, index, $event)"
                                                              :itemId="childItemId"
                                                              :helper-text="modelValue?.childrenState?.[optionItemId]?.quantity! > 1 ?
                                                                `(${quantityRepeated}/${modelValue?.childrenState?.[optionItemId]?.quantity}) ${menuRoot.allItems?.[optionItemId]?.itemLabel}` :
                                                                menuRoot.allItems?.[optionItemId]?.itemLabel" />
                            </div>
                        </div>


                    </div>
                </template>
            </div>
        </div>
    </div>
</template>
