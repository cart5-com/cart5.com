<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { ref } from 'vue';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronsUpDown } from 'lucide-vue-next';
import { useVModel } from '@vueuse/core';
import FlagComponent from '@/ui-plus/PhoneNumber/FlagComponent.vue';
import { getBrowserLocale, getCountriesList, getCountryName } from '@/ui-plus/PhoneNumber/basePhoneInput/helpers/use-phone-input';

const props = defineProps<{
    class?: HTMLAttributes['class']
    modelValue?: string;
    showCountryName?: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();

const model = useVModel(props, 'modelValue', emit, {
    passive: true,
    defaultValue: undefined,
});

const open = ref(false);
const locale = getBrowserLocale()?.browserLocale ?? 'en-US';

function getCountries() {
    return getCountriesList(locale);
}
</script>

<template>
    <Popover v-model:open="open">
        <PopoverTrigger as-child>
            <Button type="button"
                    variant="outline"
                    size="sm"
                    :class="props.class">
                <FlagComponent v-if="model"
                               :country="model" />
                <span v-if="showCountryName && model"
                      class="flex-1 text-sm text-left">
                    {{ getCountryName(locale, model) }}
                </span>
                <ChevronsUpDown class="-mr-2 opacity-50 hidden sm:block" />
            </Button>
        </PopoverTrigger>
        <PopoverContent class="w-[300px] p-0">
            <Command>
                <CommandInput placeholder="Search country..." />
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandList>
                    <CommandGroup>
                        <CommandItem v-for="option in getCountries()"
                                     :key="option.iso2"
                                     :value="option.name + ' ' + option.iso2"
                                     class="gap-2"
                                     @select="() => {
                                        model = option.iso2;
                                        open = false;
                                    }">
                            <FlagComponent :country="option?.iso2" />
                            <span class="flex-1 text-sm">{{ option.name }}</span>
                            <span class="text-foreground/50 text-sm">{{ option.iso2 }}</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </Command>
        </PopoverContent>
    </Popover>
</template>
