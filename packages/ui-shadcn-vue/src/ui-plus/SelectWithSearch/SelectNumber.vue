<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
    NumberField,
    NumberFieldContent,
    NumberFieldDecrement,
    NumberFieldIncrement,
    NumberFieldInput,
} from '@/components/ui/number-field'

const props = defineProps<{
    defaultValue?: number
    modelValue?: number
}>()

const emits = defineEmits<{
    (e: 'update:modelValue', payload: number): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
    passive: true,
    defaultValue: props.defaultValue,
})
</script>

<template>
    <Popover>
        <PopoverTrigger as-child>
            <slot name="trigger">
                <span class="cursor-text">
                    {{ modelValue || 'Edit' }}
                </span>
            </slot>
        </PopoverTrigger>
        <PopoverContent class="p-4 max-w-56"
                        align="start">

            <NumberField v-model="modelValue"
                         v-bind="$attrs">

                <NumberFieldContent>

                    <NumberFieldDecrement />
                    <NumberFieldInput />
                    <NumberFieldIncrement />

                </NumberFieldContent>

            </NumberField>

            <slot name="content">
            </slot>
        </PopoverContent>
    </Popover>
</template>
