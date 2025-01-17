<script setup lang="ts">
import type { FieldProps } from './interface'
import { FormControl, FormDescription, FormField, FormItem, FormMessage } from '@/components/ui/form'
import AutoFormLabel from './AutoFormLabel.vue'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { beautifyObjectName } from './utils'
import { ChevronsUpDown } from 'lucide-vue-next';
import { ref } from 'vue'
const open = ref(false);
defineProps<FieldProps>()

function getTimezones() {
  // @ts-ignore
  return Intl.supportedValuesOf('timeZone');
}
</script>

<template>
  <FormField v-slot="slotProps"
             :name="fieldName">
    <FormItem v-bind="$attrs">
      <AutoFormLabel v-if="!config?.hideLabel"
                     :required="required">
        {{ config?.label || beautifyObjectName(label ?? fieldName) }}
      </AutoFormLabel>
      <FormControl>
        <!-- <Input type="number" v-bind="{ ...slotProps.componentField, ...config?.inputProps }" :disabled="disabled" /> -->
        <Popover v-model:open="open">
          <PopoverTrigger class="flex w-full">
            <Button type="button"
                    :disabled="config?.inputProps?.disabled"
                    class="flex w-full"
                    variant="outline">
              <span class="flex-1 text-sm text-left">
                {{ slotProps.componentField.modelValue || 'Select timezone' }}
              </span>
              <ChevronsUpDown class="-mr-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-[300px] p-0"
                          v-if="!config?.inputProps?.disabled">
            <Command>
              <!-- autocomplete="country-name" -->
              <CommandInput placeholder="Search country..." />
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandList>
                <CommandGroup>
                  <CommandItem v-for="option in getTimezones()"
                               :key="option"
                               :value="option"
                               class="gap-2"
                               @select="() => {
                                slotProps.setValue(option);
                                open = false;
                              }
                                ">
                    <span class="flex-1 text-sm">{{ option }}</span>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </FormControl>
      <FormDescription v-if="config?.description">
        {{ config.description }}
      </FormDescription>
      <FormMessage />
    </FormItem>
  </FormField>
</template>
