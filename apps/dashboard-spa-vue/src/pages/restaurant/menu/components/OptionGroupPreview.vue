<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { type OptionGroup } from "lib/types/menuTypes";
import { Minus, Plus } from "lucide-vue-next";
import { onMounted, ref } from "vue";
// import { menuJSON } from "../store";

const props = defineProps<{
    optionGroup?: OptionGroup;
}>()

// store quantity for each option
// add only 1 if preSelected is true
const optionQuantities = ref<Record<string, {
    quantity: number;
}>>({});

const getTotalQuantity = () => {
    return Object.values(optionQuantities.value).reduce((acc, curr) => acc + curr.quantity, 0);
}

const isMaxQuantity = () => {
    if (props.optionGroup?.maxOptions && props.optionGroup?.maxOptions > 0) {
        return getTotalQuantity() >= props.optionGroup?.maxOptions;
    }
    return false;
}

const addOptionQuantity = (optionId: string | undefined) => {
    if (isMaxQuantity()) {
        return;
    }
    if (optionId) {
        optionQuantities.value[optionId] = {
            quantity: (optionQuantities.value[optionId]?.quantity || 0) + 1
        };
    }
}

const removeOptionQuantity = (optionId: string | undefined) => {
    if (optionId) {
        optionQuantities.value[optionId] = {
            quantity: (optionQuantities.value[optionId]?.quantity || 0) - 1
        };
    }
}

onMounted(() => {
    // Initialize quantities for preselected options
    props.optionGroup?.options?.forEach(option => {
        if (option?.optionId && option.preSelected) {
            // optionQuantities.value[option.optionId] = 1;
            addOptionQuantity(option.optionId)
        }
    });
})

const isDev = import.meta.env.DEV;
</script>
<template>
    <div class="border rounded-md p-2">
        <span class="text-sm">
            optionGroupId: {{ optionGroup?.optionGroupId }}
            <br>
            optionGroupLabel: {{ optionGroup?.optionGroupLabel }}
            <br>
            minOptions: {{ optionGroup?.minOptions }}
            <br>
            maxOptions: {{ optionGroup?.maxOptions }}
        </span>
        <br>
        <br>
        <div v-for="option in optionGroup?.options"
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
            quantity: {{ optionQuantities[option?.optionId!] }}
            <br>
            <Button variant="outline"
                    :disabled="isMaxQuantity()"
                    @click="addOptionQuantity(option?.optionId)">
                <Plus />
            </Button>
            <Button variant="outline"
                    v-if="optionQuantities[option?.optionId!]?.quantity > 0"
                    @click="removeOptionQuantity(option?.optionId)">
                <Minus />
            </Button>
        </div>


        <details v-if="isDev">
            <summary>
                optionQuantities
            </summary>
            <pre>{{ optionQuantities }}</pre>
        </details>
    </div>
</template>