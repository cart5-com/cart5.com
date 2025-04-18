<script lang="ts" setup>
import { useVModel } from '@vueuse/core'
import { type ItemId } from "@lib/zod/menuRootSchema";
import { type CartChildrenItemState } from "@lib/zod/cartItemState";
import { menuRoot } from "../MenuRootStore";
import { computed } from 'vue';
import { AlignJustify, CornerDownRight, Link2Off, MoreVerticalIcon, Pencil } from 'lucide-vue-next';
import SelectNumber from "@/ui-plus/SelectWithSearch/SelectNumber.vue";
import { Badge } from '@/components/ui/badge';
import InputInline from "@/ui-plus/inline-edit/InputInline.vue";
import RecursiveCustomizations from './RecursiveCustomizations.vue';
import ItemPreviewCustomizationOptions from './ItemPreviewCustomizationOptions.vue';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { previewItem } from '@dashboard-spa-vue/pages/store/menu/helpers';
import { Button } from '@/components/ui/button';
import RelationViewer from '../components/RelationViewer.vue';

const props = defineProps<{
    modelValue?: CartChildrenItemState
    itemId?: ItemId
    helperText?: string
    isDraggable?: boolean
    parentItemId?: ItemId
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
    deep: true,
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

const isMinQuantityAdded = () => {
    if (currentItem.value?.minQ && currentItem.value?.minQ > 0) {
        return getTotalQuantity() >= currentItem.value?.minQ;
    }
    return true;
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
    <div class="border rounded-md p-1 sm:p-4 my-6 border-card-foreground"
         v-if="currentItem">

        <RelationViewer :item-id="itemId!"
                        name="customization" />

        <div class="items-center mb-2 justify-self-end flex gap-2">
            <AlignJustify v-if="isDraggable"
                          class="customization-drag-handle w-5 h-5 cursor-move text-muted-foreground" />
            <span v-else />
            <DropdownMenu>
                <DropdownMenuTrigger as-child>
                    <MoreVerticalIcon class="cursor-pointer" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end"
                                     class="">

                    <DropdownMenuItem @click="previewItem(parentItemId!)"
                                      v-if="!isDraggable">
                        <Pencil /> Edit
                    </DropdownMenuItem>

                    <!-- v-if="isDraggable" -->
                    <DropdownMenuItem @click="$emit('unlink')"
                                      class="bg-destructive text-destructive-foreground">
                        <Link2Off />
                        Unlink '{{ currentItem?.lbl }}' from
                        '{{ menuRoot.allItems?.[parentItemId!]?.lbl }}'

                    </DropdownMenuItem>

                    <DropdownMenuItem @click="currentItem.maxQ = 1; currentItem.minQ = 1">
                        Make Radio/Single Option
                    </DropdownMenuItem>

                    <DropdownMenuItem @click="currentItem.maxQ = undefined; currentItem.minQ = undefined">
                        Remove All Option Limits
                    </DropdownMenuItem>

                </DropdownMenuContent>
            </DropdownMenu>
        </div>

        <Badge v-if="!isMinQuantityAdded()"
               variant="destructive"
               class="inline-block min-quantity-warning">
            Required
        </Badge>
        <Badge v-else-if="currentItem?.minQ && currentItem?.minQ > 0"
               variant="outline"
               class="inline-block">
            ✅Required
        </Badge>
        <Badge variant="outline"
               class="inline-block">
            Selected:{{ getTotalQuantity() }}
        </Badge>

        <div v-if="helperText"
             class="text-xl font-bold block">
            {{ helperText }}
        </div>

        <InputInline v-model="currentItem.lbl">
            <template #trigger>
                <span class="capitalize cursor-text text-lg block">
                    <CornerDownRight v-if="helperText"
                                     class="inline-block" />
                    {{ currentItem?.lbl || 'Name:' }}
                </span>
            </template>
        </InputInline>



        <div class="text-xs flex flex-col gap-2 items-start my-2">

            <SelectNumber v-model="currentItem.minQ"
                          :min="0"
                          @update:modelValue="(value) => {
                            if (value === 0) {
                                currentItem!.minQ = undefined
                            }
                        }">
                <template #trigger>
                    <Badge variant="outline">
                        Choose min:
                        {{ (currentItem?.minQ === 0 || !currentItem?.minQ) ? 'optional' : currentItem?.minQ }}
                    </Badge>
                </template>
                <template #content>
                    <Button variant="outline"
                            class="w-full"
                            @click="currentItem!.minQ = undefined">
                        Remove Requirement
                    </Button>
                </template>
            </SelectNumber>

            <SelectNumber v-model="currentItem.maxQ"
                          :min="0"
                          @update:modelValue="(value) => {
                            if (value === 0) {
                                currentItem!.maxQ = undefined
                            }
                        }">
                <template #trigger>
                    <Badge variant="outline">
                        Choose up to:
                        {{ (currentItem?.maxQ === 0 || !currentItem?.maxQ) ? 'unlimited' : currentItem?.maxQ }}
                    </Badge>
                </template>
                <template #content>
                    <Button variant="outline"
                            class="w-full"
                            @click="currentItem!.maxQ = undefined">
                        Remove Limit
                    </Button>
                </template>
            </SelectNumber>

        </div>

        <!-- <div class="text-xs"
             v-if="currentItem?.price">
            {{ currentItem?.price }}
        </div> -->

        <ItemPreviewCustomizationOptions v-model="modelValue"
                                         :is-draggable="isDraggable"
                                         :item-id="itemId" />

        <RecursiveCustomizations v-model="modelValue"
                                 :item-id="itemId" />

    </div>
</template>
