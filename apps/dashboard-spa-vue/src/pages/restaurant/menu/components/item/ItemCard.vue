<script setup lang="ts">
import { computed } from 'vue';
import { menuRoot } from '../../store';
import { MoveIcon } from 'lucide-vue-next';

const props = defineProps<{
    itemId: string;
}>();

const currentItem = computed(() => {
    return menuRoot.value?.allItems?.[props.itemId]
})

</script>

<template>
    <div class="border rounded-lg p-2 m-2">
        {{ currentItem?.itemLabel }}
        <MoveIcon class="item-drag-handle cursor-move" />
    </div>
</template>