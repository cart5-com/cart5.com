<script setup lang="ts">
import { Input } from '@/components/ui/input';
import { menuRoot } from '../store';
defineProps<{
    optionItemId: string;
    itemId: string;
}>();

</script>
<template>
    <div>
        <div class="text-sm my-4">
            Limit quantity of "{{ menuRoot.allItems?.[optionItemId].itemLabel }}" option
            <br>
            in "{{
                menuRoot.allItems?.[itemId].itemLabel }}"
            customization
        </div>

        <Input type="number"
               min="0"
               step="1"
               placeholder="Max quantity"
               :model-value="menuRoot.allItems[optionItemId].maxQuantityOverrides?.[itemId!]"
               @update:model-value="(value) => {
                if (!menuRoot.allItems) return;
                if (Number(value) > 0) {
                    if (!menuRoot.allItems[optionItemId].maxQuantityOverrides) {
                        menuRoot.allItems[optionItemId].maxQuantityOverrides = {}
                    }
                    menuRoot.allItems[optionItemId].maxQuantityOverrides![itemId] = Number(value)
                } else {
                    delete menuRoot.allItems?.[optionItemId]?.maxQuantityOverrides?.[itemId!]
                    if (Object.keys(menuRoot.allItems[optionItemId].maxQuantityOverrides ?? {}).length === 0) {
                        menuRoot.allItems[optionItemId].maxQuantityOverrides = undefined
                    }
                }
            }" />
        <div class="text-xs my-4">
            use 0 or empty input to remove limit
        </div>
    </div>
</template>