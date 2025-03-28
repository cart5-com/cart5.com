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
            {{ currentItem.lbl || '' }}
        </span>

        <span class="capitalize cursor-text line-clamp-3">
            {{ currentItem.dsc || '' }}
        </span>

        <div class="cursor-text flex">
            {{ currentItem.prc || '' }}
        </div>

    </div>
</template>