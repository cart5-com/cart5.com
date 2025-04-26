<script setup lang="ts">
import type { Item } from "@lib/zod/menuRootSchema";
import { orderCurrentType } from "@web-astro/stores/UserData.store";

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
            {{ orderCurrentType === "pickup" && currentItem.pickupPrc ? currentItem.pickupPrc : currentItem.prc || '' }}
        </div>

    </div>
</template>