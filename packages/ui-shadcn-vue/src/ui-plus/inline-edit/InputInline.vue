<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useVModel } from '@vueuse/core'
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Input } from '@/components/ui/input';

const props = defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  class?: HTMLAttributes['class']
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
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
    <PopoverContent class="p-1"
                    align="start">
      <Input v-model="modelValue"
             v-bind="$attrs"
             :class="props.class" />
      <slot name="content">
      </slot>
    </PopoverContent>
  </Popover>
</template>
