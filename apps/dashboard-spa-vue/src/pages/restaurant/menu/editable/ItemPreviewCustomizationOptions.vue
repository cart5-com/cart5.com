<script lang="ts" setup>
import { useVModel } from '@vueuse/core'
import { type BucketChildrenState, type ItemId } from "lib/types/menuType";
import { menuRoot } from "../store";
import { computed, onMounted, ref } from 'vue';
import {
    AlignJustify,
    Link2Off,
    Minus,
    MoreHorizontal,
    Plus,
    Pencil,
    ArrowDownUp,
    CircleCheckBig,
    Circle,
    AlertCircle
} from 'lucide-vue-next';
import InputInline from "@/ui-plus/inline-edit/InputInline.vue";
import draggable from "vuedraggable"
import { Button } from '@/components/ui/button';
import SelectWithSearch from '@/ui-plus/SelectWithSearch/SelectWithSearch.vue';
import { addChildItem, createNewItem, previewItem } from '../helpers';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

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

const removeAllQuantitiesThenAddOne = (childId: ItemId, childIndex: number) => {
    if (modelValue.value?.childrenState) {
        modelValue.value.childrenState = []
    }
    addQuantity(childId, childIndex)
}

const isChildMaxQuantity = (childId: ItemId, childIndex: number) => {
    if (menuRoot.value.allItems?.[childId!]?.maxQuantity) {
        if (modelValue.value?.childrenState?.[childIndex]?.quantity! + 1 > menuRoot.value.allItems?.[childId!]?.maxQuantity!) {
            return true;
        }
    }
}
const addQuantity = (childId: ItemId, childIndex: number) => {
    if (
        isMaxQuantity() ||
        isChildMaxQuantity(childId, childIndex)
    ) {
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
            if (modelValue.value.childrenState[childIndex].quantity < 1) {
                modelValue.value.childrenState[childIndex].quantity = 0;
            }
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
    createNewItem('option', { itemLabel }, currentItem?.value?.id);
}

const randomId = crypto.randomUUID();

const unlink = (index: number) => {
    if (!confirm('Are you sure?')) {
        return;
    }

    if (currentItem.value?.children) {
        currentItem.value.children.splice(index, 1)
        if (currentItem.value.children.length === 0) {
            currentItem.value.children = undefined
        }
    }
}

const showReorder = ref(false)


const isRadioMode = computed(() => {
    return currentItem.value?.maxQuantity === 1 && currentItem.value?.minQuantity === 1
})

const convertToSingleChoice = () => {
    if (currentItem.value) {
        currentItem.value.maxQuantity = 1
        currentItem.value.minQuantity = 1
    }
}

onMounted(() => {
    for (const [index, child] of (currentItem.value?.children || []).entries()) {
        const childItem = menuRoot.value.allItems?.[child];
        if (childItem?.preSelectedQuantity) {
            // repeat with value of childItem?.preSelectedQuantities?.[props.itemId!]
            for (let i = 0; i < childItem?.preSelectedQuantity; i++) {
                addQuantity(child, index)
            }
        }
    }
})


</script>

<template>
    <div>
        <div v-if="currentItem?.children"
             class="text-sm">



            <!-- <div v-for="(optionItemId, optionItemIndex) in currentItem?.children"
             :key="optionItemId"> -->
            <draggable v-model="currentItem.children"
                       item-key="id"
                       :group="`option-items-${randomId}`"
                       handle=".option-drag-handle">
                <template #item="{ element: optionItemId, index: optionItemIndex }">
                    <div class="border border-card-foreground rounded-md my-2 overflow-hidden">
                        <div class="items-center p-2 bg-card hover:bg-background grid grid-cols-8 gap-1"
                             :class="[
                                // (isMaxQuantity() && !isRadioMode) ? 'opacity-40 text-xs   ' : '',
                            ]">
                            <div class="flex flex-col sm:flex-row gap-2">
                                <AlignJustify v-if="showReorder"
                                              class="option-drag-handle w-5 h-5 cursor-move text-muted-foreground" />
                                <DropdownMenu>
                                    <DropdownMenuTrigger as-child>
                                        <MoreHorizontal class="cursor-pointer" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">

                                        <DropdownMenuItem @click="showReorder = !showReorder">
                                            <ArrowDownUp /> Reordering {{ showReorder ? 'Off' : 'On' }}
                                        </DropdownMenuItem>

                                        <DropdownMenuItem @click="previewItem(optionItemId)">
                                            <Pencil /> Edit
                                        </DropdownMenuItem>

                                        <DropdownMenuItem @click="unlink(optionItemIndex)"
                                                          class="bg-destructive text-destructive-foreground">
                                            <Link2Off />
                                            Unlink
                                        </DropdownMenuItem>


                                        <div class="my-4 border-y py-2">
                                            <Switch :checked="menuRoot.allItems?.[optionItemId!]?.maxQuantity! > 0"
                                                    @update:checked="(checked) => {
                                                        if (!menuRoot.allItems) return;
                                                        if (checked) {
                                                            menuRoot.allItems[optionItemId!].maxQuantity = 1
                                                        } else {
                                                            delete menuRoot.allItems?.[optionItemId!]?.maxQuantity
                                                        }
                                                    }">
                                            </Switch>
                                            Limit quantity
                                            <div v-if="menuRoot.allItems?.[optionItemId!].maxQuantity">
                                                <Input type="number"
                                                       min="1"
                                                       :model-value="menuRoot.allItems?.[optionItemId]?.maxQuantity"
                                                       @update:model-value="(value) => {
                                                        if (!menuRoot.allItems) return;
                                                        if (Number(value) < 1) {
                                                            delete menuRoot.allItems?.[optionItemId!]?.maxQuantity
                                                        } else {
                                                            menuRoot.allItems[optionItemId!].maxQuantity = Number(value)
                                                        }
                                                    }" />
                                            </div>
                                        </div>

                                        <div class="my-4 border-y py-2">
                                            <Switch :checked="menuRoot.allItems?.[optionItemId!]?.chargeAboveQuantity! > 0"
                                                    @update:checked="(checked) => {
                                                        if (!menuRoot.allItems) return;
                                                        if (checked) {
                                                            menuRoot.allItems[optionItemId!].chargeAboveQuantity = 1
                                                        } else {
                                                            delete menuRoot.allItems?.[optionItemId!]?.chargeAboveQuantity
                                                        }
                                                    }">
                                            </Switch>
                                            Charge above
                                            <div v-if="menuRoot.allItems?.[optionItemId!].chargeAboveQuantity">
                                                <Input type="number"
                                                       min="1"
                                                       :model-value="menuRoot.allItems?.[optionItemId]?.chargeAboveQuantity"
                                                       @update:model-value="(value) => {
                                                        if (!menuRoot.allItems) return;
                                                        if (Number(value) < 1) {
                                                            delete menuRoot.allItems?.[optionItemId!]?.chargeAboveQuantity
                                                        } else {
                                                            menuRoot.allItems[optionItemId!].chargeAboveQuantity = Number(value)
                                                        }
                                                    }" />
                                            </div>
                                        </div>

                                        <div class="my-4 border-y py-2">
                                            <Switch :checked="menuRoot.allItems?.[optionItemId!]?.preSelectedQuantity! > 0"
                                                    @update:checked="(checked) => {
                                                        if (!menuRoot.allItems) return;
                                                        if (checked) {
                                                            menuRoot.allItems[optionItemId!].preSelectedQuantity = 1
                                                        } else {
                                                            delete menuRoot.allItems?.[optionItemId!]?.preSelectedQuantity
                                                        }
                                                    }">
                                            </Switch>
                                            Pre-selected quantity
                                            <div v-if="menuRoot.allItems?.[optionItemId!].preSelectedQuantity">
                                                <Input type="number"
                                                       min="1"
                                                       :model-value="menuRoot.allItems?.[optionItemId]?.preSelectedQuantity"
                                                       @update:model-value="(value) => {
                                                        if (!menuRoot.allItems) return;
                                                        if (Number(value) < 1) {
                                                            delete menuRoot.allItems?.[optionItemId!]?.preSelectedQuantity
                                                        } else {
                                                            menuRoot.allItems[optionItemId!].preSelectedQuantity = Number(value)
                                                        }
                                                    }" />
                                            </div>
                                        </div>



                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <InputInline v-if="menuRoot.allItems"
                                         v-model="menuRoot.allItems[optionItemId].itemLabel">
                                <template #trigger>
                                    <span class="capitalize cursor-text col-span-5">
                                        {{ menuRoot.allItems?.[optionItemId]?.itemLabel || 'Name:' }}
                                    </span>
                                </template>
                            </InputInline>
                            <InputInline type="number"
                                         placeholder="Price - / +"
                                         :model-value="menuRoot.allItems![optionItemId]?.optionPrice"
                                         @update:model-value="(value) => {
                                            if (!menuRoot.allItems) return;
                                            if (value) {
                                                menuRoot.allItems![optionItemId!].optionPrice = Number(value)
                                            } else {
                                                delete menuRoot.allItems![optionItemId!].optionPrice
                                            }
                                        }">
                                <template #trigger>
                                    <span class="capitalize cursor-text"
                                          :class="[
                                            menuRoot.allItems![optionItemId!].optionPrice! < 0 && !isRadioMode
                                                ? 'text-destructive font-bold' : ''
                                        ]">
                                        <div v-if="menuRoot.allItems![optionItemId!].optionPrice! < 0 && !isRadioMode">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger as-child>
                                                        <AlertCircle />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p class="font-bold">
                                                            <AlertCircle class="text-destructive" />
                                                            Possible pricing error for multiple quantities
                                                            <br>
                                                            <br>
                                                            Make sure to test total price by adding multiple quantities
                                                            <br>
                                                            <br>
                                                            Adding multiple negative prices may lead to unexpected
                                                            results
                                                            <br>
                                                            <br>
                                                            This is only a warning, you can ignore it.
                                                            <br>
                                                            <hr class="my-2 border ">
                                                            or you can
                                                            <Button variant="outline"
                                                                    size="sm"
                                                                    @click="convertToSingleChoice">
                                                                convert to single choice
                                                            </Button>

                                                            <br>
                                                            <hr class="my-2 border ">
                                                            or you may add a limit
                                                            <br>to prevent multiple
                                                            negative values by enabling limit quantity inside
                                                            <MoreHorizontal /> Menu
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        {{ menuRoot.allItems![optionItemId!].optionPrice || '$' }}
                                    </span>
                                </template>
                            </InputInline>
                            <!-- <span v-if="getPrice(optionItemId)">
                        {{ getPrice(optionItemId) }}
                    </span> -->

                            <template v-if="isRadioMode">
                                <CircleCheckBig v-if="modelValue?.childrenState?.[optionItemIndex]?.quantity! > 0"
                                                @click="removeQuantity(optionItemId, optionItemIndex)"
                                                class="cursor-pointer justify-self-end" />
                                <Circle v-else
                                        @click="removeAllQuantitiesThenAddOne(optionItemId, optionItemIndex)"
                                        class="cursor-pointer justify-self-end" />
                            </template>
                            <template v-else>
                                <Plus class="border border-foreground rounded-md cursor-pointer justify-self-end"
                                      :class="[
                                        (isMaxQuantity() && !isRadioMode) ? 'opacity-40' : ''
                                    ]"
                                      @click="addQuantity(optionItemId, optionItemIndex)" />
                            </template>

                            <!-- <Plus class="border border-foreground rounded-md cursor-pointer justify-self-end"
                              @click="addQuantity(optionItemId, optionItemIndex)" /> -->
                        </div>
                        <div class="items-center border p-2 bg-card hover:bg-background text-sm font-bold grid grid-cols-8 gap-1"
                             v-if="!isRadioMode && modelValue?.childrenState?.[optionItemIndex]?.quantity! > 0">
                            <div>
                                {{ modelValue?.childrenState?.[optionItemIndex]?.quantity }} x
                            </div>
                            <!-- <div class="col-span-5 capitalize line-clamp-1">
                                {{ menuRoot.allItems?.[optionItemId]?.itemLabel }}
                            </div> -->
                            <div class="col-span-6 text-right"
                                 v-if="menuRoot.allItems?.[optionItemId!].optionPrice">
                                ${{
                                    (
                                        (menuRoot.allItems?.[optionItemId!].optionPrice!)
                                        *
                                        (modelValue?.childrenState?.[optionItemIndex]?.quantity!)
                                    ).toFixed(2)
                                }}
                            </div>
                            <div v-else
                                 class="col-span-6"></div>
                            <Minus class="border border-foreground rounded-md cursor-pointer justify-self-end"
                                   @click="removeQuantity(optionItemId, optionItemIndex)" />
                        </div>
                    </div>
                </template>
            </draggable>


        </div>
        <SelectWithSearch :items="Object.values(menuRoot.allItems ?? {})
            .filter(item => item.type === 'option' || item.type === 'item')
            .filter(item => {
                // itself not allowed
                if (currentItem?.id === item.id) {
                    return false
                }
                // parent is not allowed
                if (item.children?.includes(currentItem?.id ?? '')) {
                    return false
                }
                return true
            })
            .map(item => ({
                key: item.id,
                name: item.itemLabel
            }))"
                          @select="(item) => {
                            addChildItem(currentItem?.id, item.key)
                        }"
                          @create-new="onClickAddNewOption"
                          :has-new-button="true"
                          heading="Link an existing item">
            <template #trigger>
                <Button variant="outline"
                        size="sm">
                    <Plus /> Add New Option
                </Button>
            </template>
        </SelectWithSearch>
    </div>
</template>
