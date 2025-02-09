<script setup lang="ts">
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
        <div class="space-y-4">
            <Input id="name"
                   placeholder="Item Label"
                   v-model="currentItem.itemLabel" />
            <Textarea id="description"
                      v-model="currentItem.description"
                      placeholder="Description" />

        </div>
    </div>
</template>
