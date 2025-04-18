<script lang="ts" setup>
import { type ItemId } from "@lib/zod/menuRootSchema";
import { menuRoot } from "../../MenuRootStore";
import { computed } from 'vue';
import { Badge } from '@/components/ui/badge';
import HoverCustomizationOptions from "./HoverCustomizationOptions.vue";


const props = defineProps<{
    itemId?: ItemId
}>()

const currentItem = computed(() => {
    if (props.itemId) {
        return menuRoot.value.allItems?.[props.itemId]
    }
    return undefined
})
</script>

<template>
    <div class="border rounded-md p-1 sm:p-4 my-6 border-card-foreground"
         v-if="currentItem">

        <Badge v-if="currentItem?.minQ && currentItem?.minQ > 0"
               variant="outline"
               class="inline-block">
            ✅Required
        </Badge>

        <span class="capitalize cursor-text text-lg block">
            {{ currentItem?.lbl || 'Name:' }}
        </span>

        <HoverCustomizationOptions :item-id="itemId" />

        <!-- <ItemPreviewCustomizationOptions v-model="modelValue"
                                         :is-draggable="isDraggable"
                                         :item-id="itemId" />

        <RecursiveCustomizations v-model="modelValue"
                                 :item-id="itemId" /> -->

    </div>
</template>
