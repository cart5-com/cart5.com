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
            <Input placeholder="Item Label"
                   v-model="currentItem.itemLabel" />
            <Textarea v-model="currentItem.description"
                      placeholder="Description" />
            <Input type="number"
                   v-model="currentItem.price"
                   placeholder="Price" />

        </div>
    </div>
</template>
