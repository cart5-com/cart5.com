<script lang="ts" setup>
import { type ItemId } from 'lib/types/menuType';
import { computed } from 'vue';
import { menuRoot } from '../store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomizationOptionList from './CustomizationOptionList.vue';

const props = defineProps<{
    itemId: ItemId
}>()

const currentItem = computed(() => {
    return menuRoot.value.allItems?.[props.itemId]
})

</script>

<template>
    <div v-if="currentItem">
        <div class="grid gap-4 py-4">
            <div class="grid grid-cols-4 items-center gap-4">
                <Label for="label"
                       class="text-right">
                    Name
                </Label>
                <Input id="label"
                       placeholder="Set Label"
                       v-model="currentItem.itemLabel"
                       class="col-span-3 capitalize" />
            </div>
            <div class="grid grid-cols-4 items-center gap-4">
                <Label for="max"
                       class="text-right">
                    Minimum
                </Label>
                <Input id="min"
                       placeholder="Min"
                       min="0"
                       v-model="currentItem.minQuantity"
                       class="col-span-2"
                       type="number" />
                <span class="text-muted-foreground text-sm">
                    0: optional
                </span>
            </div>
            <div class="grid grid-cols-4 items-center gap-4">
                <Label for="max"
                       class="text-right">
                    Maximum
                </Label>
                <Input id="max"
                       placeholder="Max"
                       min="0"
                       v-model="currentItem.maxQuantity"
                       class="col-span-2"
                       type="number" />
                <span class="text-muted-foreground text-sm">
                    0: unlimited
                </span>
            </div>
        </div>
        <CustomizationOptionList :item-id="props.itemId" />
    </div>
</template>