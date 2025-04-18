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
    <div class="w-full"
         v-if="currentItem">
        <div class="">
            <div class="space-y-4">
                <span class="capitalize text-2xl font-bold">
                    {{ currentItem.lbl || 'Name:' }}
                </span>
                <span class="capitalize line-clamp-3">
                    {{ currentItem.dsc || 'Description:' }}
                </span>
                <div class="flex">
                    <Banknote class="mr-2" /> {{ currentItem.prc || 'Price:' }}
                </div>
            </div>
            <div class="mt-8">
                <div class="border rounded-lg p-1">
                    <div>
                        <ListTodo class="inline-block mr-1" />
                        Customizations
                    </div>
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