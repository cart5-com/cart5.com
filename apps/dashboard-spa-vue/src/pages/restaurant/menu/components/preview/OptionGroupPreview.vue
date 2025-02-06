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
    optionGroupId?: string;
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


const currentOptionGroup = computed(() => {
    if (props.optionGroupId) {
        return menuJSON.value?.allOptionGroups?.[props.optionGroupId]
    }
    return undefined;
});


const getTotalQuantity = () => {
    return Object.values(modelValue.value?.options || {}).reduce((acc, curr) => acc + curr.quantity, 0);
}

const isMaxQuantity = () => {
    if (currentOptionGroup.value?.maxOptions && currentOptionGroup.value?.maxOptions > 0) {
        return getTotalQuantity() >= currentOptionGroup.value?.maxOptions;
    }
    return false;
}

const addOptionQuantity = (optionId: string | undefined, hasLinkedOptions: boolean = false) => {
    if (isMaxQuantity()) {
        return;
    }
    if (optionId && modelValue.value?.options) {
        if (!modelValue.value.options[optionId]) {
            modelValue.value.options[optionId] = {
                optionId: optionId,
                quantity: 1,
                selectedOption_optionGroupIds: hasLinkedOptions ? [[]] : undefined
            };
        } else {
            if (hasLinkedOptions) {
                if (!modelValue.value.options[optionId].selectedOption_optionGroupIds) {
                    modelValue.value.options[optionId].selectedOption_optionGroupIds = [];
                }
                modelValue.value.options[optionId].selectedOption_optionGroupIds?.push([]);
            }
            modelValue.value.options[optionId].quantity++;
        }
    }
}

const removeOptionQuantity = (optionId: string | undefined, hasLinkedOptions: boolean = false) => {
    if (optionId && modelValue.value?.options) {
        if (modelValue.value.options[optionId].quantity > 0) {
            modelValue.value.options[optionId].quantity--;
            if (hasLinkedOptions) {
                if (modelValue.value.options[optionId].selectedOption_optionGroupIds) {
                    modelValue.value.options[optionId].selectedOption_optionGroupIds?.pop();
                }
            }
        }
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


const updateNestedOptionGroup = (
    optionId: string,
    quantityIndex: number,
    linkIndex: number,
    newValue: BucketOptionGroup
) => {
    if (modelValue.value?.options?.[optionId]?.selectedOption_optionGroupIds?.[quantityIndex]) {
        modelValue.value.options[optionId].selectedOption_optionGroupIds[quantityIndex][linkIndex] = newValue;
    }
}

const isDev = import.meta.env.DEV;
</script>
<template>
    <div class="my-10 border rounded-md p-2 border-dashed border-gray-300">
        <div class="border rounded-md p-2">
            <span class="text-sm">
                {{ currentOptionGroup?.optionGroupLabel }}
                <!-- optionGroupId: {{ optionGroupId }}
                <br>
                <br>
                minOptions: {{ currentOptionGroup?.minOptions }}
                <br>
                maxOptions: {{ currentOptionGroup?.maxOptions }} -->
            </span>
            <br>
            <br>
            <div v-for="option in currentOptionGroup?.options"
                 :key="option?.optionId"
                 class="border rounded-md p-2 my-1">
                <!-- optionId: {{ option?.optionId }}
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
                <br> -->
                {{ option?.label }} ${{ option?.price }}
                <Button variant="outline"
                        :disabled="isMaxQuantity()"
                        @click="addOptionQuantity(option?.optionId, option?.optionLinks ? option?.optionLinks?.length > 0 : false)">
                    <Plus />
                </Button>
                <Button variant="outline"
                        v-if="modelValue?.options && modelValue?.options?.[option?.optionId!]?.quantity > 0"
                        @click="removeOptionQuantity(option?.optionId, option?.optionLinks ? option?.optionLinks?.length > 0 : false)">
                    <Minus />
                </Button>
                {{ modelValue?.options?.[option?.optionId!]?.quantity }}
                <br>
                - {{ option?.optionId }} -
                <br>
                {{ option?.optionLinks }}

                <div v-if="option?.optionLinks">
                    <template v-for="quantityRepeated in modelValue?.options?.[option?.optionId!]?.quantity"
                              :key="`${option?.optionId}-${quantityRepeated}`">

                        <div class="text-xs text-muted-foreground border rounded-md p-2 border-destructive mt-16">
                            <div>
                                {{ option?.label }}
                                (
                                {{ quantityRepeated }} /
                                {{ modelValue?.options?.[option?.optionId!]?.quantity }}
                                )
                            </div>
                            <div v-for="(linkedOption, index) in option?.optionLinks"
                                 :key="`${linkedOption.optionGroupId}-${quantityRepeated}-${index}`">
                                <div v-if="linkedOption.optionGroupId">
                                    <!-- optionGroupId: {{ linkedOption.optionGroupId }} -->
                                    <!-- {{ menuJSON.allOptionGroups?.[linkedOption.optionGroupId].optionGroupLabel }} -->
                                    <!-- v-model="modelValue.options[linkedOption.optionGroupId].selectedOption_optionGroupIds[quantityRepeated - 1]"  -->
                                    <details>
                                        <summary>modelValue.options[{{ option?.optionId }}]</summary>
                                        <pre>{{ modelValue?.options?.[option?.optionId!] }}</pre>
                                    </details>
                                    <!-- :model-value="modelValue?.options?.[option?.optionId!]?.selectedOption_optionGroupIds?.[quantityRepeated - 1]?.[index]"
                                    @update:model-value="(newVal) => {
                                        if (
                                            option &&
                                            option.optionId &&
                                            modelValue &&
                                            modelValue.options &&
                                            modelValue.options[option.optionId] &&
                                            modelValue.options[option.optionId].selectedOption_optionGroupIds &&
                                            modelValue.options[option.optionId].selectedOption_optionGroupIds[quantityRepeated - 1] &&
                                            modelValue.options[option.optionId].selectedOption_optionGroupIds[quantityRepeated - 1][index]
                                        ) {
                                            modelValue.options[option.optionId].selectedOption_optionGroupIds[quantityRepeated - 1][index] = newVal;
                                        }
                                    }" -->
                                    <OptionGroupPreview :optionGroupId="linkedOption.optionGroupId"
                                                        :model-value="modelValue?.options?.[option?.optionId!]?.selectedOption_optionGroupIds?.[quantityRepeated - 1]?.[index]"
                                                        @update:model-value="updateNestedOptionGroup(option?.optionId!, quantityRepeated - 1, index, $event)" />
                                </div>
                            </div>
                        </div>

                    </template>
                </div>
                <!-- <div v-for="
                                                        groupId
                                                        in
                                                        linkedOption.linkedGroups"
                                                        :key="`${linkedOption.optionId}-${quantityRepeated}-${groupId}`"
                                                        class="ml-4 mt-2 border-l-2 pl-2">
                                        <span class="text-xs text-muted-foreground">
                                            Linked choices for
                                            {{ currentOptionGroup?.options?.find(o => o.optionId === linkedOption.optionId)?.label }}
                                            ({{ quantityRepeated }}/{{ linkedOption.quantity }})
                                        </span>
                                        :model-value="modelValue?.options?.[linkedOption.optionId]?.selectedOption_optionGroupIds?.[quantityRepeated
                                        - 1]"
                                        @update:model-value="(newVal) => {
                                        ensureOptionGroupArrays(linkedOption.optionId);
                                        if (modelValue?.options?.[linkedOption.optionId]?.selectedOption_optionGroupIds)
                                        {
                                        modelValue.options[linkedOption.optionId].selectedOption_optionGroupIds[quantityRepeated
                                        - 1] = newVal;
                                        }
                                        }"
                                        <OptionGroupPreview :optionGroupId="groupId" />
                                </div> -->


            </div>
        </div>

        <details v-if="isDev">
            <summary>
                modelValue
            </summary>
            <pre>{{ modelValue }}</pre>
        </details>
    </div>
</template>