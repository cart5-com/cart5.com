<script setup lang="ts">
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ref } from 'vue'
import { ChevronsUpDown } from 'lucide-vue-next';
import { getBrowserLocale } from '@/ui-plus/PhoneNumber/basePhoneInput/helpers/use-phone-input';
import { stripeSupportedCurrencies } from '@lib/utils/stripe/StripeSupportedCurrencies';
const open = ref(false);

defineProps<{
    modelValue: string
}>();


const locale = getBrowserLocale()?.browserLocale ?? 'en-US'
function formatCurrency(amount: number, currency: string) {
    if (!currency || currency === '') {
        return '';
    }
    const rx = /(?<= ).+/;
    const result = Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        currencyDisplay: "name"
    }).format(amount).match(rx);
    return result ? result[0].trim() : '';
}

function getSupportedCurrencies() {
    let currencies: { currency: string, name: string }[] = [];
    // const supportedCurrencies = Intl.supportedValuesOf('currency');
    const supportedCurrencies = Object.keys(stripeSupportedCurrencies);
    supportedCurrencies.forEach((cur) => {
        let obj = {
            currency: cur,
            name: formatCurrency(0, cur),
        };
        currencies.push(obj);
    });
    return currencies;
}
</script>


<template>
    <Popover v-model:open="open">
        <PopoverTrigger class="flex w-full">
            <Button type="button"
                    class="flex w-full"
                    variant="outline">
                <span class="flex-1 flex items-stretch text-sm text-left gap-2"
                      v-if="modelValue">
                    <span class="flex-1 text-sm">{{ modelValue }}</span>
                    <span class="text-foreground/50 text-sm">
                        {{ formatCurrency(0, modelValue) }}
                    </span>
                </span>
                <ChevronsUpDown class="-mr-2 h-4 w-4 opacity-50" />
            </Button>
        </PopoverTrigger>
        <PopoverContent class="w-[300px] p-0">
            <Command>
                <CommandInput placeholder="Search currency..." />
                <CommandEmpty>No currency found.</CommandEmpty>
                <CommandList>
                    <CommandGroup>
                        <CommandItem v-for="item in getSupportedCurrencies()"
                                     :key="item.currency"
                                     :value="`${item.currency} ${item.name}`"
                                     class="gap-2"
                                     @select="() => {
                                        $emit('update:modelValue', item.currency);
                                        open = false;
                                    }
                                    ">
                            <span class="flex-1 text-sm">{{ item.currency }}</span>
                            <span class="text-foreground/50 text-sm">
                                {{ item.name }}
                            </span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </Command>
        </PopoverContent>
    </Popover>
</template>