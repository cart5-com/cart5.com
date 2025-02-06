<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-vue-next";
import { computed, ref } from "vue";
import { menuJSON } from "../../store";
import { type BucketItemOptionGroup } from "lib/types/bucketType";

const props = defineProps<{
    optionGroupId: string;
    parentOptionGroup?: BucketItemOptionGroup;
}>()

const currentOptionGroup = computed(() =>
    menuJSON.value?.allOptionGroups?.[props.optionGroupId]
);

// Track selections for this option group
const selections = ref<BucketItemOptionGroup['selections']>([]);

const getTotalQuantity = () => {
    return selections.value?.reduce((sum, sel) => sum + (sel.quantity || 0), 0) || 0;
}

const isMaxQuantityAdded = () => {
    const maxOptions = currentOptionGroup.value?.maxOptions;
    if (maxOptions && maxOptions > 0) {
        return getTotalQuantity() >= maxOptions;
    }
    return false;
}

const addOptionQuantity = (optionId: string) => {
    if (isMaxQuantityAdded()) return;

    const existing = selections.value?.find(s => s.optionId === optionId);
    if (existing) {
        if (!existing.quantity) {
            existing.quantity = 1;
        } else {
            existing.quantity++;
        }
    } else {
        selections.value?.push({
            optionId,
            quantity: 1,
            nestedOptionGroups: []
        });
    }

    // Update parent option group if exists
    if (props.parentOptionGroup) {
        props.parentOptionGroup.selections = selections.value;
    }
}

const removeOptionQuantity = (optionId: string) => {
    const index = selections.value?.findIndex(s => s.optionId === optionId);
    if (index && index >= 0) {
        if (selections.value?.[index]?.quantity && selections.value?.[index]?.quantity > 1) {
            selections.value[index].quantity--;
        } else {
            selections.value?.splice(index, 1);
        }
    }
}

// Get quantity for an option
const getOptionQuantity = (optionId: string) => {
    return selections.value?.find(s => s.optionId === optionId)?.quantity || 0;
}
</script>

<template>
    <div class="border rounded-md p-2"
         v-if="currentOptionGroup">
        <div class="text-sm font-medium mb-2">
            {{ currentOptionGroup.optionGroupLabel }}
            <span v-if="currentOptionGroup.minOptions"
                  class="text-xs text-muted-foreground">
                (Min: {{ currentOptionGroup.minOptions }})
            </span>
            <span v-if="currentOptionGroup.maxOptions"
                  class="text-xs text-muted-foreground">
                (Max: {{ currentOptionGroup.maxOptions }})
            </span>
        </div>

        <div v-for="option in currentOptionGroup.options"
             :key="option?.optionId"
             class="border rounded-md p-2 my-1">
            <div class="flex items-center justify-between">
                <span>{{ option?.label }}</span>
                <div class="flex items-center gap-2">
                    <Button variant="outline"
                            size="sm"
                            :disabled="isMaxQuantityAdded()"
                            @click="addOptionQuantity(option?.optionId!)">
                        <Plus class="w-4 h-4" />
                    </Button>
                    <span>{{ getOptionQuantity(option?.optionId!) }}</span>
                    <Button variant="outline"
                            size="sm"
                            :disabled="getOptionQuantity(option?.optionId!) === 0"
                            @click="removeOptionQuantity(option?.optionId!)">
                        <Minus class="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <!-- Render nested option groups -->
            <div v-if="option?.optionLinks"
                 class="ml-4 mt-2">
                <div v-for="link in option.optionLinks.filter(l => l.type === 'option-group')"
                     :key="link.optionGroupId">
                    link:{{ link }}
                    <!-- <template v-if="link.type === 'option-group'">
                        <OptionGroupPreview :optionGroupId="link.optionGroupId!"
                                            :parentOptionGroup="{
                                                optionGroupId: props.optionGroupId,
                                                selections: selections.value
                                            }" />
                    </template> -->
                </div>
            </div>
        </div>
    </div>
</template>