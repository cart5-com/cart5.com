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

let cachedTimezones: {
  name: string;
  formatted: string;
}[];

function getTimezones(): {
  name: string;
  formatted: string;
}[] {
  if (cachedTimezones) {
    return cachedTimezones;
  }
  cachedTimezones = Intl.supportedValuesOf('timeZone')
    .map((timezone: string) => ({
      name: timezone,
      formatted: formatTimezone(timezone),
    }));
  return cachedTimezones;
}
function formatTimezone(timezone: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      timeZoneName: 'shortGeneric',
      timeZone: timezone,
    }).formatToParts().find(part => part.type === 'timeZoneName')?.value || timezone;
  } catch (e) {
    return timezone;
  }
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
                               :key="option.name"
                               :value="option.name + ' ' + option.formatted"
                               class="gap-2"
                               @select="() => {
                                slotProps.setValue(option.name);
                                open = false;
                              }
                                ">
                    <span class="flex-1 text-sm">{{ option.name }}</span>
                    <span class="text-foreground/50 text-sm">{{ option.formatted }}</span>
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
