<script setup lang="ts">
import type { Item, CartItem, } from "@lib/types/menuType";
import ItemCustomizationCard from "./ItemCustomizationCard.vue";

const props = defineProps<{
    currentItem?: Item,
    cartItem?: CartItem
}>()

</script>

<template>
    <div v-if="currentItem"
         class="mt-8">
        <div v-if="currentItem">
            <div class="space-y-2"
                 v-for="(child, index) in currentItem.cIds"
                 :key="child">
                <ItemCustomizationCard v-if="cartItem?.childrenState"
                                       :parent-item-id="currentItem?.id!"
                                       :itemId="child"
                                       v-model="cartItem.childrenState[index]!" />
            </div>
        </div>
    </div>
</template>