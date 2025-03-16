<script setup lang="ts">
import type { FieldProps } from '../auto-form/interface'
import { FormControl, FormDescription, FormField, FormItem, FormMessage } from '@/components/ui/form'
import AutoFormLabel from '../auto-form/AutoFormLabel.vue'
import SPhoneInput from './SPhoneInput.vue'
import { beautifyObjectName } from '../auto-form/utils'
import { type Results } from '../PhoneNumber/basePhoneInput/helpers/types'
import { ref, watch } from 'vue'

defineProps<FieldProps>()

// Add watch for slotProps value
const phoneValue = ref('')
const formValue = ref('')

// Watch slot props value changes
watch(
  () => formValue?.value,
  (newValue) => {
    if (newValue) {
      phoneValue.value = newValue
    }
  }
)
</script>

<template>
  <FormField v-slot="slotProps"
             :name="fieldName">
    <template v-if="formValue !== slotProps.value">
      {{ formValue = slotProps.value }}
    </template>
    <FormItem v-bind="$attrs">
      <AutoFormLabel v-if="!config?.hideLabel"
                     :required="required">
        {{ config?.label || beautifyObjectName(label ?? fieldName) }}
      </AutoFormLabel>
      <FormControl>
        <slot v-bind="slotProps">
          <SPhoneInput :fieldName="fieldName"
                       v-model="phoneValue"
                       @update="($event: Results) => {
                        if ($event.isValid) {
                          slotProps.handleChange($event.e164)
                        } else {
                          slotProps.handleChange(undefined)
                        }
                      }"
                       @blur="slotProps.handleBlur" />
        </slot>
      </FormControl>
      <FormDescription v-if="config?.description">
        {{ config.description }}
      </FormDescription>
      <FormMessage />
    </FormItem>
  </FormField>
</template>
