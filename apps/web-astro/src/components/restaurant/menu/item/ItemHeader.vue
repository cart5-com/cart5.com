<script setup lang="ts">
import type { Item } from "@lib/types/menuType";

defineProps<{
    currentItem?: Item
}>()


</script>

<template>
    <div class="space-y-4"
         v-if="currentItem">

        <span class="capitalize cursor-text text-2xl font-bold">
            {{ currentItem.lbl || 'Name:' }}
        </span>

        <span class="capitalize cursor-text line-clamp-3">
            {{ currentItem.dsc || 'Description:' }}
        </span>

        <div class="cursor-text flex">
            {{ currentItem.prc || 'Price:' }}
        </div>

    </div>
</template>