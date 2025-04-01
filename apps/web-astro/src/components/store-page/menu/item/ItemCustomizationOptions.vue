<script lang="ts" setup>
import { useVModel } from '@vueuse/core'
import { type CartChildrenItemState, type ItemId } from "@lib/types/menuType";
import { roundTo2Decimals } from "@lib/utils/roundTo2Decimals";
import { computed, onMounted } from 'vue';
import {
    Minus,
    Plus,
    CircleCheckBig,
    Circle
} from 'lucide-vue-next';

const props = defineProps<{
    modelValue?: CartChildrenItemState
    itemId?: ItemId
    helperText?: string
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

const isMaxQuantity = () => {
    if (currentItem.value?.maxQ && currentItem.value?.maxQ > 0) {
        return getTotalQuantity() >= currentItem.value?.maxQ;
    }
    return false;
}

const removeAllQuantitiesThenAddOne = (childId: ItemId, childIndex: number) => {
    if (modelValue.value?.childrenState) {
        modelValue.value.childrenState = []
    }
    addQuantity(childId, childIndex)
}

const isChildMaxQuantity = (childId: ItemId, childIndex: number) => {
    if (window.storeData?.menu?.menuRoot?.allItems?.[childId!]?.maxQ) {
        if (modelValue.value?.childrenState?.[childIndex]?.quantity! + 1 > window.storeData?.menu?.menuRoot?.allItems?.[childId!]?.maxQ!) {
            return true;
        }
    }
    return false;
}

const addQuantity = (childId: ItemId, childIndex: number) => {
    if (
        isMaxQuantity() ||
        isChildMaxQuantity(childId, childIndex)
    ) {
        return;
    }

    let hasLinkedOptions: boolean = false;
    if (window.storeData?.menu?.menuRoot?.allItems?.[childId]?.cIds) {
        hasLinkedOptions = true;
    }
    if (modelValue.value?.childrenState) {
        if (!modelValue.value.childrenState[childIndex]) {
            modelValue.value.childrenState[childIndex] = {
                itemId: childId,
                quantity: 1,
                childrenState: hasLinkedOptions ? [[]] : undefined
            } as {
                itemId?: string;
                quantity?: number;
                childrenState?: CartChildrenItemState[][];
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
    if (window.storeData?.menu?.menuRoot?.allItems?.[childId]?.cIds) {
        hasLinkedOptions = true;
    }
    if (modelValue.value?.childrenState) {
        if (modelValue.value.childrenState[childIndex]?.quantity) {
            modelValue.value.childrenState[childIndex].quantity--;
            if (modelValue.value.childrenState[childIndex].quantity < 1) {
                modelValue.value.childrenState[childIndex].quantity = 0;
            }
        }
        if (hasLinkedOptions) {
            if (modelValue.value.childrenState[childIndex]?.childrenState) {
                modelValue.value.childrenState[childIndex].childrenState?.pop();
            }
        }
        if (modelValue.value.childrenState[childIndex]?.quantity === 0) {
            modelValue.value.childrenState = [
                ...modelValue.value.childrenState.slice(0, childIndex),
                null,
                ...modelValue.value.childrenState.slice(childIndex + 1)
            ];
        }
    }
}

const isRadioMode = computed(() => {
    return currentItem.value?.maxQ === 1 && currentItem.value?.minQ === 1
})

onMounted(() => {
    const initialState = JSON.parse(JSON.stringify(modelValue.value)) as CartChildrenItemState;
    for (const [index, child] of (currentItem.value?.cIds || []).entries()) {
        const childItem = window.storeData?.menu?.menuRoot?.allItems?.[child];
        if (childItem?.defQ) {
            // repeat with value of childItem?.preSelectedQuantities?.[props.itemId!]
            for (let i = 0; i < childItem?.defQ; i++) {
                // console.log("adding quantity", currentItem.value?.lbl, childItem?.lbl, JSON.stringify(modelValue.value?.childrenState, null, 2))
                if (initialState?.childrenState?.length === 0) {
                    addQuantity(child, index)
                }
            }
        }
    }
})

const menuRoot = window.storeData?.menu?.menuRoot

const addQuantityClick = (optionItemIndex: number, optionItemId: ItemId) => {
    if (isRadioMode.value) {
        if (modelValue?.value?.childrenState?.[optionItemIndex]?.quantity! > 0) {
            removeQuantity(optionItemId, optionItemIndex)
        } else {
            removeAllQuantitiesThenAddOne(optionItemId, optionItemIndex)
        }
    } else {
        addQuantity(optionItemId, optionItemIndex)
    }
}

</script>

<template>
    <div>
        <div v-if="currentItem?.cIds && menuRoot"
             class="text-sm">
            <div v-for="(optionItemId, optionItemIndex) in currentItem?.cIds"
                 :key="optionItemId">
                <div class="border border-card-foreground rounded-md my-2 overflow-hidden">

                    <div class="items-center p-2 bg-card hover:bg-background grid grid-cols-8 gap-1"
                         :class="[
                            (!isRadioMode && ((isMaxQuantity() || isChildMaxQuantity(optionItemId, optionItemIndex)))) ? 'cursor-not-allowed' : 'cursor-pointer'
                        ]"
                         @click="addQuantityClick(optionItemIndex, optionItemId)">
                        <span class="capitalize col-span-6">
                            {{ menuRoot.allItems?.[optionItemId]?.lbl || '' }}
                        </span>
                        <span class="capitalize text-right"
                              :class="[
                                menuRoot.allItems?.[optionItemId!]?.opPrc! < 0 && !isRadioMode
                                    ? 'text-destructive font-bold' : ''
                            ]">
                            {{ menuRoot.allItems?.[optionItemId!]?.opPrc }}
                        </span>

                        <template v-if="isRadioMode">
                            <CircleCheckBig v-if="modelValue?.childrenState?.[optionItemIndex]?.quantity! > 0"
                                            class="justify-self-end" />
                            <Circle v-else
                                    class="justify-self-end" />
                        </template>
                        <template v-else>
                            <Plus class="border border-foreground rounded-md justify-self-end"
                                  :class="[
                                    ((isMaxQuantity() || isChildMaxQuantity(optionItemId, optionItemIndex))) ? 'opacity-40 cursor-not-allowed' : ''
                                ]" />
                        </template>
                    </div>


                    <div class="items-center border p-2 bg-card hover:bg-background text-sm font-bold grid grid-cols-8 gap-1 cursor-pointer"
                         v-if="!isRadioMode && modelValue?.childrenState?.[optionItemIndex]?.quantity! > 0"
                         @click="removeQuantity(optionItemId, optionItemIndex)">
                        <div>
                            {{ modelValue?.childrenState?.[optionItemIndex]?.quantity }} x
                        </div>
                        <div class="col-span-6 text-right"
                             v-if="menuRoot.allItems?.[optionItemId!]?.opPrc">
                            {{
                                roundTo2Decimals(
                                    (menuRoot.allItems?.[optionItemId!]?.opPrc!)
                                    *
                                    (modelValue?.childrenState?.[optionItemIndex]?.quantity!)
                                )
                            }}
                        </div>
                        <div v-else
                             class="col-span-6"></div>
                        <Minus class="border border-foreground rounded-md justify-self-end" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
