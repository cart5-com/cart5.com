<script lang="ts" setup>
import { computed } from 'vue';
import { menuRoot } from '../store';
import { AlignJustify } from 'lucide-vue-next';

const props = defineProps<{
    itemId: string
}>()

const currentItem = computed(() => {
    return menuRoot.value?.allItems?.[props.itemId]
})
</script>
<template>
    <div class="border rounded-md p-4 mb-4 bg-card hover:bg-accent">
        <h3>{{ currentItem?.itemLabel }}</h3>
        <AlignJustify class="cat-drag-handle cursor-move" />
    </div>
</template>