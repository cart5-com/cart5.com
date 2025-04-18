<script setup lang="ts">
import { menuRoot } from "../../MenuRootStore";
import { type ItemId } from "@lib/zod/menuRootSchema";
import { Banknote, ListTodo } from "lucide-vue-next";
import { computed } from "vue";
import Button from "@/components/ui/button/Button.vue";
import HoverCustomizationCard from "./HoverCustomizationCard.vue";

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
    <div class="w-full max-h-80 overflow-y-auto"
         v-if="currentItem">
        <div class="p-1 sm:p-4">
            <div class="space-y-4">
                <span class="capitalize cursor-text text-2xl font-bold">
                    {{ currentItem.lbl || 'Name:' }}
                </span>
                <span class="capitalize cursor-text line-clamp-3">
                    {{ currentItem.dsc || 'Description:' }}
                </span>
                <div class="cursor-text flex">
                    <Banknote class="mr-2" /> {{ currentItem.prc || 'Price:' }}
                </div>
            </div>
            <div class="mt-8">
                <div class="border rounded-lg p-1 sm:p-4">
                    <Button variant="ghost">
                        <ListTodo />
                        Customizations
                    </Button>
                    <div v-for="child in currentItem.cIds">
                        <HoverCustomizationCard :item-id="child" />
                    </div>
                </div>
            </div>
            <!--
                 <ItemPreviewEditableHeader
                 :current-item="currentItem" />
            <div :class="`warning-container-${randomNumber}`">
                <ItemPreviewEditableCustomizations :current-item="currentItem"
                                                   :cartItem="cartItem" />
            </div> -->
        </div>
    </div>
</template>