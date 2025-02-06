<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { useVModel } from '@vueuse/core'
import { Minus, Plus } from "lucide-vue-next";
import { computed, onMounted } from "vue";
import { type Ref } from 'vue'
import { menuJSON } from "../../store";
import { type BucketOptionGroup } from "lib/types/menuTypes";

const props = defineProps<{
    modelValue?: BucketOptionGroup;
    optionGroupId: string;
}>()

const emits = defineEmits<{
    (e: 'update:modelValue', payload: BucketOptionGroup): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
    passive: true,
    defaultValue: {
        optionGroupId: props.optionGroupId,
        options: {},
    },
    deep: props.modelValue ? false : true,
}) as Ref<typeof props.modelValue>;


const currentOptionGroup = computed(() =>
    menuJSON.value?.allOptionGroups?.[props.optionGroupId]
);
// // store quantity for each option
// // add only 1 if preSelected is true
// const optionQuantities = ref<Record<string, {
//     quantity: number;
// }>>({});


const getTotalQuantity = () => {
    return Object.values(modelValue.value?.options || {}).reduce((acc, curr) => acc + curr.quantity, 0);
}

const isMaxQuantity = () => {
    if (currentOptionGroup.value?.maxOptions && currentOptionGroup.value?.maxOptions > 0) {
        return getTotalQuantity() >= currentOptionGroup.value?.maxOptions;
    }
    return false;
}

const addOptionQuantity = (optionId: string | undefined) => {
    if (isMaxQuantity()) {
        return;
    }
    if (optionId && modelValue.value?.options) {
        modelValue.value.options[optionId] = {
            optionId: optionId,
            quantity: (modelValue.value.options[optionId]?.quantity || 0) + 1,
            selectedOption_optionGroupIds: []
        };
    }
}

const removeOptionQuantity = (optionId: string | undefined) => {
    if (optionId && modelValue.value?.options) {
        modelValue.value.options[optionId] = {
            quantity: (modelValue.value.options[optionId]?.quantity || 0) - 1
        };
        // if quantity is 0, remove the option
        if (modelValue.value.options[optionId]?.quantity === 0) {
            delete modelValue.value.options[optionId];
        }
    }
}

onMounted(() => {
    // Initialize quantities for preselected options
    currentOptionGroup.value?.options?.forEach(option => {
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
            optionGroupId: {{ optionGroupId }}
            <br>
            optionGroupLabel: {{ currentOptionGroup?.optionGroupLabel }}
            <br>
            minOptions: {{ currentOptionGroup?.minOptions }}
            <br>
            maxOptions: {{ currentOptionGroup?.maxOptions }}
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
            quantity: {{ modelValue?.options?.[option?.optionId!]?.quantity }}
            <br>
            <Button variant="outline"
                    :disabled="isMaxQuantity()"
                    @click="addOptionQuantity(option?.optionId)">
                <Plus />
            </Button>
            <Button variant="outline"
                    v-if="modelValue?.options && modelValue?.options?.[option?.optionId!]?.quantity > 0"
                    @click="removeOptionQuantity(option?.optionId)">
                <Minus />
            </Button>
        </div>


        <details v-if="isDev">
            <summary>
                modelValue
            </summary>
            <pre>{{ modelValue }}</pre>
        </details>
    </div>
</template>