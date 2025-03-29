<script setup lang="ts">
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ref } from 'vue'
import FlagComponent from '@/ui-plus/PhoneNumber/FlagComponent.vue';
import { getBrowserLocale, getCountryName } from '@/ui-plus/PhoneNumber/basePhoneInput/helpers/use-phone-input';
import { ChevronsUpDown, HelpCircle } from 'lucide-vue-next';
import { salesTaxRates } from '@lib/utils/sales_tax_rates';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'

const open = ref(false);

const locale = getBrowserLocale()?.browserLocale ?? 'en-US'

defineProps<{
    countryCodeHelper: string;
}>();

const country = ref('');
const setCountry = (newVal: string) => {
    country.value = newVal;
}

defineExpose({
    setCountry
})
</script>
<template>
    <div>
        <Collapsible class="space-y-2 border rounded-md">
            <CollapsibleTrigger as-child>
                <div class="cursor-pointer flex items-center justify-between space-x-4 px-4 border-b">
                    <h4 class="text-sm font-semibold">
                        Tax Information Help
                    </h4>
                    <Button variant="ghost"
                            size="sm"
                            class="w-9 p-0">
                        <!-- <ChevronsUpDown class="h-4 w-4" /> -->
                        <HelpCircle />
                        <span class="sr-only">Toggle</span>
                    </Button>
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent class="space-y-2">

                <Popover v-model:open="open">
                    <PopoverTrigger class="flex w-full">
                        <Button type="button"
                                class="flex w-full"
                                variant="outline">
                            <FlagComponent :country="country" />
                            <span v-if="country"
                                  class="flex-1 text-sm text-left">
                                {{ getCountryName(locale, country) }}
                            </span>
                            <ChevronsUpDown class="-mr-2 h-4 w-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent class="w-[300px] p-0">
                        <Command>
                            <!-- autocomplete="country-name" -->
                            <CommandInput placeholder="Search country..." />
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandList>
                                <CommandGroup>
                                    <CommandItem v-for="(value, key) in salesTaxRates"
                                                 :key="key"
                                                 :value="getCountryName(locale, key) + ' ' + value.currency + ' (' + value.type.toUpperCase() + ')'"
                                                 class="gap-2"
                                                 @select="() => {
                                                    country = key;
                                                    open = false;
                                                }
                                                ">
                                        <FlagComponent :country="key" />
                                        <span class="flex-1 text-sm">{{ getCountryName(locale, key) }}</span>
                                        <span class="text-foreground/50 text-sm">{{ value.currency }}
                                            ({{ value.type.toUpperCase() }})</span>
                                    </CommandItem>
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>

                <div v-if="country">
                    <div v-if="salesTaxRates[country]"
                         class="p-4 space-y-4">
                        <div class="grid grid-cols-3 gap-4">
                            <div class="p-3 bg-secondary/40 rounded-lg">
                                <div class="text-sm text-muted-foreground">Tax Name</div>
                                <div class="font-medium">{{ salesTaxRates[country].type.toUpperCase() }}</div>
                            </div>
                            <div class="p-3 bg-secondary/40 rounded-lg">
                                <div class="text-sm text-muted-foreground">Tax Rate</div>
                                <div class="font-medium">{{ (salesTaxRates[country].rate * 100).toFixed(0) }}%</div>
                            </div>
                            <div class="p-3 bg-secondary/40 rounded-lg">
                                <div class="text-sm text-muted-foreground">Currency</div>
                                <div class="font-medium">{{ salesTaxRates[country].currency }}</div>
                            </div>
                        </div>

                        <div v-if="salesTaxRates[country].states"
                             class="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>State</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>State Rate</TableHead>
                                        <TableHead>Total Rate</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow v-for="key in Object.keys(salesTaxRates[country].states!)"
                                              :key="key">
                                        <TableCell class="font-medium">{{ key }}</TableCell>
                                        <TableCell>{{ salesTaxRates[country].states![key].type.toUpperCase() }}
                                        </TableCell>
                                        <TableCell>
                                            {{ (salesTaxRates[country].states![key].rate * 100).toFixed(0) }}%
                                        </TableCell>
                                        <TableCell>
                                            {{ ((salesTaxRates[country].states![key].rate * 100) + (salesTaxRates[country].rate * 100)).toFixed(0) }}%
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                    <div v-else
                         class="bg-destructive/30 p-4 rounded-md">
                        No tax information available for this country
                    </div>
                </div>



            </CollapsibleContent>
        </Collapsible>
    </div>
</template>