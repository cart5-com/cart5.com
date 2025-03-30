<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useVModel } from '@vueuse/core'
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import type { TaxCategory } from '@lib/types/taxTypes'

const props = defineProps<{
  defaultValue?: string
  modelValue?: string
  taxCategories?: TaxCategory[]
  class?: HTMLAttributes['class']
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
})

const getTaxCategoryName = (categoryId?: string) => {
  return props.taxCategories?.find(cat => cat.id === categoryId)?.name ||
    props.taxCategories?.[0]?.name
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <slot name="trigger">
        <span class="cursor-text">
          Tax:{{ getTaxCategoryName(modelValue) }}
        </span>
      </slot>
    </PopoverTrigger>
    <PopoverContent class="p-3 w-[200px]"
                    align="start">
      <select v-model="modelValue"
              class="w-full text-lg font-bold">
        <option :value="undefined">Default:({{ getTaxCategoryName(modelValue) }})</option>
        <option v-for="category in taxCategories"
                :key="category.id"
                :value="category.id ?? ''"
                :selected="category.id === modelValue">
          {{ category.name }}
        </option>
      </select>
      <div class="text-xs text-muted-foreground">
        Add new tax rates with "Sidemenu" -> "Tax Settings"
      </div>
    </PopoverContent>
  </Popover>
</template>
