<script setup lang="ts">
import type { FieldProps } from './interface'
import { FormControl, FormDescription, FormField, FormItem, FormMessage } from '@/components/ui/form'
import AutoFormLabel from './AutoFormLabel.vue'
import { beautifyObjectName } from './utils'
import {
  PinInput,
  PinInputGroup,
  PinInputInput,
} from '@/components/ui/pin-input'
import { ref } from 'vue'

const pinModel = ref<string[]>([])
const props = defineProps<FieldProps>()
// @ts-ignore
const length = props.config?.inputProps?.length ?? 5;
</script>

<template>
  <FormField v-slot="slotProps"
             :name="fieldName">
    <FormItem>
      <div class="space-y-0 mb-3 flex items-center gap-3">
        <AutoFormLabel v-if="!config?.hideLabel"
                       :required="required">
          {{ config?.label || beautifyObjectName(label ?? fieldName) }}
        </AutoFormLabel>
        <FormControl>
          <slot v-bind="slotProps">
            <PinInput :disabled="disabled"
                      placeholder="○"
                      class="flex gap-2 items-center mt-1"
                      otp
                      type="number"
                      @complete="(e: string[]) => {
                        slotProps.handleChange(e.join(''))
                      }"
                      @update:modelValue="(arrStr: string[]) => {
                        slotProps.handleChange(arrStr.filter(Boolean).join(''))
                      }"
                      v-model="pinModel">
              <PinInputGroup>
                <PinInputInput v-for="(id, index) in length"
                               :key="id"
                               :index="index" />
              </PinInputGroup>
            </PinInput>
          </slot>
        </FormControl>

      </div>

      <FormDescription v-if="config?.description">
        {{ config.description }}
      </FormDescription>
      <FormMessage />
    </FormItem>
  </FormField>
</template>
