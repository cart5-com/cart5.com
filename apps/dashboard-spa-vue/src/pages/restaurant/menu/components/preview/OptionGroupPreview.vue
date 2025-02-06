<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-vue-next";
import { computed, onMounted } from "vue";
import { menuJSON } from "../../store";
import { type BucketItem } from "lib/types/bucketType";

const props = defineProps<{
    optionGroupId?: string;
    bucketItem: BucketItem;
}>()

const currentOptionGroup = computed(() =>
    props.optionGroupId ? menuJSON.value?.allOptionGroups?.[props.optionGroupId] : undefined
);

const getTotalQuantity = () => {
    // TODO:
    return 0;
}

const isMaxQuantityAdded = () => {
    if (props.optionGroupId) {
        if (currentOptionGroup.value?.maxOptions && currentOptionGroup.value?.maxOptions > 0) {
            return getTotalQuantity() >= currentOptionGroup.value?.maxOptions;
        }
    }
    return false;
}

const addOptionQuantity = (optionId: string | undefined) => {
    if (isMaxQuantityAdded()) {
        return;
    }
    // TODO: where to keep the quantity?
}

const removeOptionQuantity = (optionId: string | undefined) => {
    if (optionId) {
        // TODO: remove quantity
    }
}

onMounted(() => {
    // Initialize quantities for preselected options
    if (props.optionGroupId) {
        currentOptionGroup.value?.options?.forEach(option => {
            if (option?.optionId && option.preSelected) {
                // optionQuantities.value[option.optionId] = 1;
                addOptionQuantity(option.optionId)
            }
        });
    }
})

</script>
<template>
    <div class="border rounded-md p-2"
         v-if="currentOptionGroup">
        <span class="text-sm">
            optionGroupId: {{ optionGroupId }}
            <br>
            optionGroupLabel: {{ currentOptionGroup?.optionGroupLabel }}
            <br>
            <span v-if="currentOptionGroup?.minOptions && currentOptionGroup?.minOptions > 0">
                min {{ currentOptionGroup?.minOptions }} selection required
            </span>
            <br>
            <span v-if="currentOptionGroup?.maxOptions && currentOptionGroup?.maxOptions > 0">
                You may add up to {{ currentOptionGroup?.maxOptions }} options
            </span>
        </span>
        <br>
        <br>
        <div v-for="option in currentOptionGroup?.options"
             :key="option?.optionId"
             class="border rounded-md p-2 my-1">
            optionId: {{ option?.optionId }}
            <br>
            label: {{ option?.label }}
            <br>
            price: {{ option?.price }}
            <br>
            preSelected: {{ option?.preSelected }}
            <br>
            optionLinks: {{ option?.optionLinks }}
            <br>
            <!-- quantity: {{ optionQuantities[option?.optionId!] }} -->
            <br>
            <Button variant="outline"
                    :disabled="isMaxQuantityAdded()"
                    @click="addOptionQuantity(option?.optionId)">
                <Plus />
            </Button>
            <!-- v-if="optionQuantities[option?.optionId!]?.quantity > 0" -->
            <Button variant="outline"
                    @click="removeOptionQuantity(option?.optionId)">
                <Minus />
            </Button>
        </div>
    </div>
</template>