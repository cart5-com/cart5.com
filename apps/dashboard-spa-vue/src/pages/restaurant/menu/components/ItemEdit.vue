<script setup lang="ts">
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { menuRoot } from "../store";
import { type ItemId } from "lib/types/menuType";
import { computed } from "vue";
import CustomizationList from "./CustomizationList.vue";

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
                   class="capitalize"
                   v-model="currentItem.itemLabel" />
            <Textarea v-model="currentItem.description"
                      placeholder="Description" />
            <Input type="number"
                   v-model="currentItem.price"
                   placeholder="Price" />
            <CustomizationList :item-id="props.itemId" />
        </div>
        <details>
            <summary>currentItem</summary>
            <pre class="text-xs max-w-full overflow-y-auto">{{ currentItem }}</pre>
        </details>
    </div>
</template>
