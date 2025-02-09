<script setup lang="ts">
import { menuJSON } from "../../store";
import { type BucketItem } from "lib/types/menuTypes-old";

const props = defineProps<{
    itemId: string;
    bucketItem: BucketItem;
}>()

const setSelectedSizeId = (sizeId: string | undefined) => {
    if (sizeId) {
        props.bucketItem.selectedSizeId = sizeId;
    } else {
        props.bucketItem.selectedSizeId = undefined;
    }
}

</script>
<template>
    <div v-if="menuJSON.allItems?.[itemId]?.itemSizes">
        <div v-for="size in menuJSON.allItems?.[itemId]?.itemSizes"
             :class="[
                'cursor-pointer transition-colors p-1 capitalize line-clamp-1 overflow-hidden border bg-card rounded-md my-1',
                bucketItem.selectedSizeId === size.itemSizeId ? 'bg-primary text-primary-foreground border-primary' : ''
            ]"
             :key="size.itemSizeId"
             @click="setSelectedSizeId(size.itemSizeId)">
            <div class="flex justify-between gap-1">
                <span class="text-sm">
                    {{ size.itemSizeLabel }}
                </span>
                <span class="text-xs">
                    ${{ size.price }}
                </span>
            </div>
        </div>
    </div>
</template>