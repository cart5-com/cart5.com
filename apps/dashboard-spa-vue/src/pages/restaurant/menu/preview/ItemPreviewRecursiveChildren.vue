<script lang="ts" setup>
import { useVModel } from '@vueuse/core'
import { type CartChildrenItemState, type ItemId } from "lib/types/menuType";
import { menuRoot } from "../store";
import { computed } from 'vue';
import { Minus, Plus } from 'lucide-vue-next';

const props = defineProps<{
    modelValue?: CartChildrenItemState
    itemId?: ItemId
    helperText?: string
}>()

const emits = defineEmits<{
    (e: 'update:modelValue', payload: CartChildrenItemState): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
    passive: true,
    defaultValue: {
        itemId: props.itemId,
        childrenState: [],
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
    if (currentItem.value?.maxQ && currentItem.value?.maxQ > 0) {
        return getTotalQuantity() >= currentItem.value?.maxQ;
    }
    return false;
}

const isMinQuantityAdded = () => {
    if (currentItem.value?.minQ && currentItem.value?.minQ > 0) {
        return getTotalQuantity() >= currentItem.value?.minQ;
    }
    return true;
}

const addQuantity = (childId: ItemId, childIndex: number) => {
    if (isMaxQuantity()) {
        return;
    }
    let hasLinkedOptions: boolean = false;
    if (menuRoot.value.allItems?.[childId]?.cIds) {
        hasLinkedOptions = true;
    }
    if (modelValue.value?.childrenState) {
        if (!modelValue.value.childrenState[childIndex]) {
            modelValue.value.childrenState[childIndex] = {
                itemId: childId,
                quantity: 1,
                childrenState: hasLinkedOptions ? [[]] : undefined
            }
        } else {
            if (hasLinkedOptions) {
                modelValue.value.childrenState[childIndex].childrenState?.push([]);
            }
            if (modelValue.value.childrenState[childIndex].quantity) {
                modelValue.value.childrenState[childIndex].quantity++;
            }
        }
    }
}

const removeQuantity = (childId: ItemId, childIndex: number) => {
    let hasLinkedOptions: boolean = false;
    if (menuRoot.value.allItems?.[childId]?.cIds) {
        hasLinkedOptions = true;
    }
    if (modelValue.value?.childrenState) {
        if (modelValue.value.childrenState[childIndex].quantity) {
            modelValue.value.childrenState[childIndex].quantity--;
        }
        if (hasLinkedOptions) {
            if (modelValue.value.childrenState[childIndex].childrenState) {
                modelValue.value.childrenState[childIndex].childrenState?.pop();
            }
        }
        if (modelValue.value.childrenState[childIndex].quantity === 0) {
            delete modelValue.value.childrenState[childIndex];
        }
    }
}

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
        <div class="text-lg font-bold capitalize">
            {{ currentItem?.lbl }}
        </div>
        <div class="text-xs text-muted-foreground">
            <span v-if="currentItem?.minQ && currentItem?.minQ > 0">
                Choose min:{{ currentItem?.minQ }}
            </span>
            <span v-if="currentItem?.maxQ && currentItem?.maxQ > 0">
                (Up to {{ currentItem?.maxQ }})
            </span>
        </div>

        <div class="text-xs"
             v-if="currentItem?.prc">
            ${{ currentItem?.prc }}
        </div>
        <div v-if="currentItem?.cIds"
             v-for="(optionItemId, optionItemIndex) in currentItem?.cIds"
             :key="optionItemId"
             class="text-sm">
            <div class="border border-card-foreground rounded-md my-2 overflow-hidden">
                <div class="flex justify-between items-center cursor-pointer p-2 bg-card hover:bg-background"
                     :class="[
                        isMaxQuantity() ? 'opacity-40 text-xs   ' : '',
                    ]"
                     @click="addQuantity(optionItemId, optionItemIndex)">
                    <span class="capitalize">
                        {{ menuRoot.allItems?.[optionItemId]?.lbl }}
                    </span>
                    <span v-if="menuRoot.allItems?.[optionItemId]?.opPrc">
                        {{ menuRoot.allItems?.[optionItemId]?.opPrc }}
                    </span>
                    <Plus class="border border-foreground rounded-md" />
                </div>
                <div class="flex justify-between items-center cursor-pointer border p-2 bg-card hover:bg-background text-sm font-bold"
                     v-if="modelValue?.childrenState?.[optionItemIndex]?.quantity! > 0"
                     @click="removeQuantity(optionItemId, optionItemIndex)">
                    <span>
                        {{ modelValue?.childrenState?.[optionItemIndex]?.quantity }} x
                        <span class="capitalize">
                            {{ menuRoot.allItems?.[optionItemId]?.lbl }}
                        </span>
                    </span>
                    <Minus class="border border-foreground rounded-md" />
                </div>
            </div>
        </div>
        <div v-if="currentItem?.cIds"
             v-for="(optionItemId, optionItemIndex) in currentItem?.cIds"
             :key="optionItemId">
            <div v-if="menuRoot.allItems?.[optionItemId]?.cIds">
                <template v-for="quantityRepeated in modelValue?.childrenState?.[optionItemIndex]?.quantity"
                          :key="`${optionItemId}-${quantityRepeated}`">
                    <div class="py-2 my-8">
                        <div v-for="(childItemId, index) in menuRoot.allItems?.[optionItemId]?.cIds"
                             :key="`${childItemId}-${quantityRepeated}-${index}`">
                            <div v-if="childItemId">
                                <ItemPreviewRecursiveChildren :model-value="modelValue?.childrenState?.[optionItemIndex]?.childrenState?.[quantityRepeated - 1]?.[index]"
                                                              @update:model-value="updateNestedOptionGroup(optionItemId, optionItemIndex, quantityRepeated - 1, index, $event)"
                                                              :itemId="childItemId"
                                                              :helper-text="modelValue?.childrenState?.[optionItemIndex]?.quantity! > 1 ?
                                                                `(${quantityRepeated}/${modelValue?.childrenState?.[optionItemIndex]?.quantity}) ${menuRoot.allItems?.[optionItemId]?.lbl}` :
                                                                menuRoot.allItems?.[optionItemId]?.lbl" />
                            </div>
                        </div>


                    </div>
                </template>
            </div>
        </div>
    </div>
</template>
