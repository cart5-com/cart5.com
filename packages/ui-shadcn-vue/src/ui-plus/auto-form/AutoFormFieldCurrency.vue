<script setup lang="ts">
import type { FieldProps } from './interface'
import { FormControl, FormDescription, FormField, FormItem, FormMessage } from '@/components/ui/form'
import AutoFormLabel from './AutoFormLabel.vue'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { beautifyObjectName } from './utils'
import { ref } from 'vue'
import FlagComponent from '@/ui-plus/PhoneNumber/FlagComponent.vue';
import { getBrowserLocale, getCountriesList, getCountryName } from '@/ui-plus/PhoneNumber/basePhoneInput/helpers/use-phone-input';
import { ChevronsUpDown } from 'lucide-vue-next';
import { getAllISOCodes } from 'iso-country-currency'



const open = ref(false)
const locale = getBrowserLocale()?.browserLocale ?? 'en-US'
defineProps<FieldProps>()

// Get unique currencies with their symbols
const getCurrencyList = () => {
  const allCountries = getAllISOCodes()
  const uniqueCurrencies = new Map()

  allCountries.forEach(country => {
    if (!uniqueCurrencies.has(country.currency)) {
      uniqueCurrencies.set(country.currency, {
        currency: country.currency,
        symbol: country.symbol,
        // Using first country's ISO as reference
        iso2: country.iso
      })
    }
  })

  return Array.from(uniqueCurrencies.values())
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
        <Popover v-model:open="open">
          <PopoverTrigger class="flex w-full">
            <Button type="button"
                    :disabled="config?.inputProps?.disabled"
                    class="flex w-full"
                    variant="outline">
              <FlagComponent :country="slotProps.componentField.modelValue" />
              <span v-if="slotProps.componentField.modelValue"
                    class="flex-1 text-sm text-left">
                {{ slotProps.componentField.modelValue }}
              </span>
              <ChevronsUpDown class="-mr-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-[300px] p-0"
                          v-if="!config?.inputProps?.disabled">
            <Command>
              <CommandInput placeholder="Search currency..." />
              <CommandEmpty>No currency found.</CommandEmpty>
              <CommandList>
                <CommandGroup>
                  <CommandItem v-for="option in getCurrencyList()"
                               :key="option.currency"
                               :value="option.currency"
                               class="gap-2"
                               @select="() => {
                                slotProps.setValue(option.currency);
                                open = false;
                              }">
                    <FlagComponent :country="option.iso2" />
                    <span class="flex-1 text-sm">{{ option.currency }}</span>
                    <span class="text-foreground/50 text-sm">{{ option.symbol }}</span>
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
