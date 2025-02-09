<script setup lang="ts">
import { Input } from "@/components/ui/input";
import { menuRoot } from "@src/pages/restaurant/menu/store";
import { type ItemId } from "lib/types/menuType2";
import { computed } from "vue";

const props = defineProps<{
    itemId: ItemId
}>()

const currentItem = computed(() => {
    return menuRoot.value.allItems?.[props.itemId]
})

</script>

<template>
    <div v-if="currentItem">
        <Input v-model="currentItem.itemLabel" />
    </div>
</template>
