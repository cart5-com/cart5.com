<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useVModel } from '@vueuse/core'
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import type { TaxCategory } from '@lib/types/taxTypes'
import { Percent } from 'lucide-vue-next'

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

// const getSummary = (categoryId?: string) => {
//   const category = props.taxCategories?.find(cat => cat.id === categoryId)
//   if (!category) return '0%'
//   return `${category.name}:🛵${category.deliveryRate}%|🛍️${category.pickupRate}%`
// }

const getTaxCategoryName = (categoryId?: string) => {
  return props.taxCategories?.find(cat => cat.id === categoryId)?.name ||
    props.taxCategories?.[0]?.name || '0%'
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <slot name="trigger">
        <div class="cursor-text flex">
          <Percent class="mr-2" />
          {{ getTaxCategoryName(modelValue) }}
        </div>
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
      <div class="text-xs text-muted-foreground mt-2">
        Add new tax rates with "Sidemenu" -> "Tax Settings"
      </div>
      <div class="text-xs text-muted-foreground mt-2">
        Default is the first tax category in "Tax Settings"
        If no tax category is selected, the default tax category will be used.
      </div>
    </PopoverContent>
  </Popover>
</template>
