<script lang="ts" setup>
import { useVModel } from '@vueuse/core'
import { type BucketChildrenState, type ItemId } from "lib/types/menuType";
import { menuRoot } from "../store";
import { computed } from 'vue';
import { AlignJustify, Link2Off, Minus, Plus } from 'lucide-vue-next';
import SelectNumber from "@/ui-plus/SelectWithSearch/SelectNumber.vue";
import { Badge } from '@/components/ui/badge';
import InputInline from "@/ui-plus/inline-edit/InputInline.vue";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import RepeatEditable from './RepeatEditable.vue';

const props = defineProps<{
    modelValue?: BucketChildrenState
    itemId?: ItemId
    helperText?: string
    isDraggable?: boolean
}>()

const emits = defineEmits<{
    (e: 'update:modelValue', payload: BucketChildrenState): void
    (e: 'unlink'): void
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

const addQuantity = (childId: ItemId, childIndex: number) => {
    if (isMaxQuantity()) {
        return;
    }
    let hasLinkedOptions: boolean = false;
    if (menuRoot.value.allItems?.[childId]?.children) {
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
    if (menuRoot.value.allItems?.[childId]?.children) {
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



// const getPrice = (itemId: ItemId) => {
//     // menuRoot.allItems[itemId].priceOverrides?.[currentItem?.itemId!]
//     if (props.itemId) {
//         if (menuRoot.value.allItems?.[itemId]?.priceOverrides?.[props.itemId]) {
//             return menuRoot.value.allItems?.[itemId]?.priceOverrides?.[props.itemId]
//         }
//     }
// }

</script>

<template>
    <div class="border rounded-md p-4 my-6 border-card-foreground"
         v-if="currentItem">

        <div v-if="isDraggable"
             class="flex justify-between items-center mb-2">
            <AlignJustify class="customization-drag-handle w-5 h-5 cursor-move text-muted-foreground" />
            <Button variant="destructive"
                    @click="$emit('unlink')"
                    size="sm">
                <Link2Off /> Unlink
            </Button>
        </div>

        <div v-if="!isMinQuantityAdded()"
             class="text-xs font-bold rounded-md bg-destructive text-destructive-foreground p-1 min-quantity-warning mb-2">
            {{ currentItem?.minQuantity }}
            Selection Required
        </div>

        <div v-if="helperText"
             class="text-lg font-bold">
            {{ helperText }}
        </div>

        <InputInline v-model="currentItem.itemLabel">
            <template #trigger>
                <span class="capitalize cursor-text text-lg font-bold">
                    {{ currentItem?.itemLabel || 'Name:' }}
                </span>
            </template>
        </InputInline>



        <div class="text-xs flex flex-col gap-2 items-start my-2">
            <SelectNumber :items="Array.from({ length: 10 }, (_, i) => ({
                key: i + 1,
                name: String(i + 1)
            }))"
                          placeholder="Force minimum"
                          type="number"
                          :min="1"
                          btn-text="Make Optional"
                          @select="(value) => {
                            if (currentItem) {
                                currentItem.minQuantity = Number(value.key)
                            }
                        }">
                <template #trigger>
                    <Badge variant="outline">
                        Choose min:
                        {{ (currentItem?.minQuantity === 0 || !currentItem?.minQuantity) ? 'optional' : currentItem?.minQuantity }}
                    </Badge>
                </template>
            </SelectNumber>
            <SelectNumber :items="Array.from({ length: 10 }, (_, i) => ({
                key: i + 1,
                name: String(i + 1)
            }))"
                          placeholder="Force maximum"
                          type="number"
                          :min="1"
                          btn-text="Make Unlimited"
                          @select="(value) => {
                            if (currentItem) {
                                currentItem.maxQuantity = Number(value.key)
                            }
                        }">
                <template #trigger>
                    <Badge variant="outline">
                        Choose up to:
                        {{ (currentItem?.maxQuantity === 0 || !currentItem?.maxQuantity) ? 'unlimited' : currentItem?.maxQuantity }}
                    </Badge>
                </template>
            </SelectNumber>
        </div>

        <!-- <div class="text-xs"
             v-if="currentItem?.price">
            ${{ currentItem?.price }}
        </div> -->

        <div v-if="currentItem?.children"
             v-for="(optionItemId, optionItemIndex) in currentItem?.children"
             :key="optionItemId"
             class="text-sm">
            <div class="border border-card-foreground rounded-md my-2 overflow-hidden">
                <div class="items-center p-2 bg-card hover:bg-background grid grid-cols-6 gap-2"
                     :class="[
                        isMaxQuantity() ? 'opacity-40 text-xs   ' : '',
                    ]">
                    <InputInline v-if="menuRoot.allItems"
                                 v-model="menuRoot.allItems[optionItemId].itemLabel">
                        <template #trigger>
                            <span class="capitalize cursor-text col-span-4">
                                {{ menuRoot.allItems?.[optionItemId]?.itemLabel || 'Name:' }}
                            </span>
                        </template>
                    </InputInline>
                    <InputInline type="number"
                                 placeholder="Price - / +"
                                 :model-value="menuRoot.allItems[optionItemId].priceOverrides?.[itemId!]"
                                 @update:model-value="(value) => {
                                    if (!menuRoot.allItems) return;
                                    if (value) {
                                        if (!menuRoot.allItems[optionItemId].priceOverrides) {
                                            menuRoot.allItems[optionItemId].priceOverrides = {}
                                        }
                                        menuRoot.allItems[optionItemId].priceOverrides[itemId!] = Number(value)
                                    } else {
                                        delete menuRoot.allItems?.[optionItemId]?.priceOverrides?.[itemId!]
                                        if (Object.keys(menuRoot.allItems[optionItemId].priceOverrides ?? {}).length === 0) {
                                            menuRoot.allItems[optionItemId].priceOverrides = undefined
                                        }
                                    }
                                }">
                        <template #trigger>
                            <span class="capitalize cursor-text">
                                {{ menuRoot.allItems?.[optionItemId]?.priceOverrides?.[itemId!] || '$' }}
                            </span>
                        </template>
                    </InputInline>
                    <!-- <span v-if="getPrice(optionItemId)">
                        {{ getPrice(optionItemId) }}
                    </span> -->
                    <Plus class="border border-foreground rounded-md cursor-pointer justify-self-end"
                          @click="addQuantity(optionItemId, optionItemIndex)" />
                </div>
                <div class="flex justify-between items-center border p-2 bg-card hover:bg-background text-sm font-bold"
                     v-if="modelValue?.childrenState?.[optionItemIndex]?.quantity! > 0">
                    <span>
                        {{ modelValue?.childrenState?.[optionItemIndex]?.quantity }} x
                        <span class="capitalize">
                            {{ menuRoot.allItems?.[optionItemId]?.itemLabel }}
                        </span>
                    </span>
                    <Minus class="border border-foreground rounded-md cursor-pointer"
                           @click="removeQuantity(optionItemId, optionItemIndex)" />
                </div>
            </div>
        </div>

        <RepeatEditable v-model="modelValue"
                        :item-id="itemId" />

    </div>
</template>
