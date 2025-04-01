<script lang="ts" setup>
import { useVModel } from '@vueuse/core'
import { type CartChildrenItemState, type ItemId } from "@lib/types/menuType";
import { roundTo2Decimals } from "@lib/utils/roundTo2Decimals";
import { menuRoot } from "../MenuRootStore";
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
    modelValue?: CartChildrenItemState
    itemId?: ItemId
    helperText?: string
    isDraggable?: boolean
}>()

const emits = defineEmits<{
    (e: 'update:modelValue', payload: CartChildrenItemState): void
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
    if (menuRoot.value.allItems?.[childId!]?.maxQ) {
        if (modelValue.value?.childrenState?.[childIndex]?.quantity! + 1 > menuRoot.value.allItems?.[childId!]?.maxQ!) {
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

const onClickAddNewOption = (search: string | undefined) => {
    const childLen = (currentItem?.value?.cIds || [])?.length;
    const lbl = search ? search : `Option ${childLen === 0 ? '' : `(${childLen + 1})`}`;
    createNewItem('o', { lbl }, currentItem?.value?.id);
}

const randomId = crypto.randomUUID();

const unlink = (index: number) => {
    if (!confirm('Are you sure?')) {
        return;
    }

    if (currentItem.value?.cIds) {
        currentItem.value.cIds.splice(index, 1)
        if (currentItem.value.cIds.length === 0) {
            currentItem.value.cIds = undefined
        }
    }
}

const showReorder = ref(false)


const isRadioMode = computed(() => {
    return currentItem.value?.maxQ === 1 && currentItem.value?.minQ === 1
})

const convertToSingleChoice = () => {
    if (currentItem.value) {
        currentItem.value.maxQ = 1
        currentItem.value.minQ = 1
    }
}

onMounted(() => {
    const initialState = JSON.parse(JSON.stringify(modelValue.value)) as CartChildrenItemState;
    for (const [index, child] of (currentItem.value?.cIds || []).entries()) {
        const childItem = menuRoot.value.allItems?.[child];
        if (childItem?.defQ) {
            // repeat with value of childItem?.preSelectedQuantities?.[props.itemId!]
            for (let i = 0; i < childItem?.defQ; i++) {
                if (initialState?.childrenState?.length === 0) {
                    addQuantity(child, index)
                }
            }
        }
    }
})


</script>

<template>
    <div>
        <div v-if="currentItem?.cIds"
             class="text-sm">



            <!-- <div v-for="(optionItemId, optionItemIndex) in currentItem?.children"
             :key="optionItemId"> -->
            <draggable v-model="currentItem.cIds"
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
                                            <Switch :checked="menuRoot.allItems?.[optionItemId!]?.maxQ! > 0"
                                                    @update:checked="(checked) => {
                                                        if (!menuRoot.allItems) return;
                                                        if (checked) {
                                                            menuRoot.allItems[optionItemId!].maxQ = 1
                                                        } else {
                                                            delete menuRoot.allItems?.[optionItemId!]?.maxQ
                                                        }
                                                    }">
                                            </Switch>
                                            Limit quantity
                                            <div v-if="menuRoot.allItems?.[optionItemId!].maxQ">
                                                <Input type="number"
                                                       min="1"
                                                       :model-value="menuRoot.allItems?.[optionItemId]?.maxQ"
                                                       @update:model-value="(value) => {
                                                        if (!menuRoot.allItems) return;
                                                        if (Number(value) < 1) {
                                                            delete menuRoot.allItems?.[optionItemId!]?.maxQ
                                                        } else {
                                                            menuRoot.allItems[optionItemId!].maxQ = Number(value)
                                                        }
                                                    }" />
                                            </div>
                                        </div>

                                        <div class="my-4 border-y py-2">
                                            <Switch :checked="menuRoot.allItems?.[optionItemId!]?.chrgAbvQ! > 0"
                                                    @update:checked="(checked) => {
                                                        if (!menuRoot.allItems) return;
                                                        if (checked) {
                                                            menuRoot.allItems[optionItemId!].chrgAbvQ = 1
                                                        } else {
                                                            delete menuRoot.allItems?.[optionItemId!]?.chrgAbvQ
                                                        }
                                                    }">
                                            </Switch>
                                            Charge above
                                            <div v-if="menuRoot.allItems?.[optionItemId!].chrgAbvQ">
                                                <Input type="number"
                                                       min="1"
                                                       :model-value="menuRoot.allItems?.[optionItemId]?.chrgAbvQ"
                                                       @update:model-value="(value) => {
                                                        if (!menuRoot.allItems) return;
                                                        if (Number(value) < 1) {
                                                            delete menuRoot.allItems?.[optionItemId!]?.chrgAbvQ
                                                        } else {
                                                            menuRoot.allItems[optionItemId!].chrgAbvQ = Number(value)
                                                        }
                                                    }" />
                                            </div>
                                        </div>

                                        <div class="my-4 border-y py-2">
                                            <Switch :checked="menuRoot.allItems?.[optionItemId!]?.defQ! > 0"
                                                    @update:checked="(checked) => {
                                                        if (!menuRoot.allItems) return;
                                                        if (checked) {
                                                            menuRoot.allItems[optionItemId!].defQ = 1
                                                        } else {
                                                            delete menuRoot.allItems?.[optionItemId!]?.defQ
                                                        }
                                                    }">
                                            </Switch>
                                            Pre-selected quantity
                                            <div v-if="menuRoot.allItems?.[optionItemId!].defQ">
                                                <Input type="number"
                                                       min="1"
                                                       :model-value="menuRoot.allItems?.[optionItemId]?.defQ"
                                                       @update:model-value="(value) => {
                                                        if (!menuRoot.allItems) return;
                                                        if (Number(value) < 1) {
                                                            delete menuRoot.allItems?.[optionItemId!]?.defQ
                                                        } else {
                                                            menuRoot.allItems[optionItemId!].defQ = Number(value)
                                                        }
                                                    }" />
                                            </div>
                                        </div>



                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <InputInline v-if="menuRoot.allItems && menuRoot.allItems[optionItemId]"
                                         v-model="menuRoot.allItems[optionItemId].lbl">
                                <template #trigger>
                                    <span class="capitalize cursor-text col-span-5">
                                        {{ menuRoot.allItems?.[optionItemId]?.lbl || 'Name:' }}
                                    </span>
                                </template>
                            </InputInline>
                            <InputInline type="number"
                                         placeholder="Price - / +"
                                         :model-value="menuRoot.allItems![optionItemId]?.opPrc"
                                         @update:model-value="(value) => {
                                            if (!menuRoot.allItems) return;
                                            if (value) {
                                                menuRoot.allItems![optionItemId!].opPrc = Number(value)
                                            } else {
                                                delete menuRoot.allItems![optionItemId!].opPrc
                                            }
                                        }">
                                <template #trigger>
                                    <span class="capitalize cursor-text text-right"
                                          :class="[
                                            menuRoot.allItems![optionItemId!].opPrc! < 0 && !isRadioMode
                                                ? 'text-destructive font-bold' : ''
                                        ]">
                                        <div v-if="menuRoot.allItems![optionItemId!].opPrc! < 0 && !isRadioMode">
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
                                                            <span class="my-2 border block"></span>
                                                            or you can
                                                            <Button variant="outline"
                                                                    size="sm"
                                                                    @click="convertToSingleChoice">
                                                                convert to single choice
                                                            </Button>

                                                            <br>
                                                            <span class="my-2 border block"></span>
                                                            or you may add a limit
                                                            <br>to prevent multiple
                                                            negative values by enabling limit quantity inside
                                                            <MoreHorizontal /> Menu
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        {{ menuRoot.allItems![optionItemId!].opPrc || '+price' }}
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
                                        ((isMaxQuantity() || isChildMaxQuantity(optionItemId, optionItemIndex))) ? 'opacity-40 cursor-not-allowed' : ''
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
                                 v-if="menuRoot.allItems?.[optionItemId!].opPrc">
                                {{
                                    roundTo2Decimals(
                                        (menuRoot.allItems?.[optionItemId!].opPrc!)
                                        *
                                        (modelValue?.childrenState?.[optionItemIndex]?.quantity!)
                                    )
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
            .filter(item => item.t === 'o' || item.t === 'i')
            .filter(item => {
                // itself not allowed
                if (currentItem?.id === item.id) {
                    return false
                }
                // parent is not allowed
                if (item.cIds?.includes(currentItem?.id ?? '')) {
                    return false
                }
                return true
            })
            .map(item => ({
                key: item.id,
                name: item.lbl
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
