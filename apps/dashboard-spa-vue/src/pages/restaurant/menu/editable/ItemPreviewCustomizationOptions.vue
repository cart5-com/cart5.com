<script lang="ts" setup>
import { useVModel } from '@vueuse/core'
import { type BucketChildrenState, type ItemId } from "lib/types/menuType";
import { menuRoot } from "../store";
import { computed } from 'vue';
import { AlignJustify, Link2Off, Minus, Plus } from 'lucide-vue-next';
import InputInline from "@/ui-plus/inline-edit/InputInline.vue";
import draggable from "vuedraggable"
import { Button } from '@/components/ui/button';
import SelectWithSearch from '@/ui-plus/SelectWithSearch/SelectWithSearch.vue';
import { addChildItem, createNewItem } from '@src/pages/restaurant/menu/helpers';
import { Label } from '@/components/ui/label';

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

const onClickAddNewOption = (search: string | undefined) => {
    const childLen = (currentItem?.value?.children || [])?.length;
    const itemLabel = search ? search : `Option ${childLen === 0 ? '' : `(${childLen + 1})`}`;
    createNewItem('option', { itemLabel }, currentItem?.value?.itemId);
}

const randomId = crypto.randomUUID();

const unlink = (index: number) => {
    if (currentItem.value?.children) {
        currentItem.value.children.splice(index, 1)
        if (currentItem.value.children.length === 0) {
            currentItem.value.children = undefined
        }
    }
}
</script>

<template>
    <div v-if="currentItem?.children"
         class="text-sm">

        <div class="flex justify-between items-center mb-4 gap-2">
            <Label>
                Available Options
            </Label>
            <SelectWithSearch :items="Object.values(menuRoot.allItems ?? {})
                .filter(item => {
                    // itself not allowed
                    if (currentItem?.itemId === item.itemId) {
                        return false
                    }
                    // parent is not allowed
                    if (item.children?.includes(currentItem?.itemId ?? '')) {
                        return false
                    }
                    return true
                })
                .map(item => ({
                    key: item.itemId,
                    name: item.itemLabel
                }))"
                              @select="(item) => {
                                addChildItem(currentItem?.itemId, item.key)
                            }"
                              @create-new="onClickAddNewOption"
                              :has-new-button="true"
                              heading="Link an existing item">
                <template #trigger>
                    <Button variant="outline">
                        <Plus />
                    </Button>
                </template>
            </SelectWithSearch>
        </div>

        <!-- <div v-for="(optionItemId, optionItemIndex) in currentItem?.children"
             :key="optionItemId"> -->
        <draggable v-model="currentItem.children"
                   item-key="itemId"
                   :group="`option-items-${randomId}`"
                   handle=".option-drag-handle">
            <template #item="{ element: optionItemId, index: optionItemIndex }">
                <div class="border border-card-foreground rounded-md my-2 overflow-hidden">
                    <div class="items-center p-2 bg-card hover:bg-background grid grid-cols-10 gap-2"
                         :class="[
                            isMaxQuantity() ? 'opacity-40 text-xs   ' : '',
                        ]">
                        <AlignJustify class="option-drag-handle w-5 h-5 cursor-move text-muted-foreground" />
                        <Button variant="destructive"
                                @click="unlink(optionItemIndex)"
                                size="sm">
                            <Link2Off />
                        </Button>
                        <InputInline v-if="menuRoot.allItems"
                                     v-model="menuRoot.allItems[optionItemId].itemLabel">
                            <template #trigger>
                                <span class="capitalize cursor-text col-span-6">
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
            </template>
        </draggable>

    </div>
</template>
