<script setup lang="ts">
import { ref } from 'vue';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronsUpDown } from 'lucide-vue-next';
import { useVModel } from '@vueuse/core'
import { getCurrentTimeNow } from '@lib/utils/isOpenNow';

const props = defineProps<{
  modelValue: string | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const model = useVModel(props, 'modelValue', emit, {
  passive: true,
  defaultValue: Intl.DateTimeFormat().resolvedOptions().timeZone,
});

const open = ref(false);

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
  <Popover v-model:open="open">
    <PopoverTrigger class="flex w-full">
      <Button type="button"
              class="flex w-full"
              variant="outline">
        <span class="flex-1 text-sm text-left">
          {{ model || 'Select timezone' }}
        </span>
        <ChevronsUpDown class="-mr-2 h-4 w-4 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-[300px] p-0">
      <Command>
        <CommandInput placeholder="Search timezone..." />
        <CommandEmpty>No timezone found.</CommandEmpty>
        <CommandList>
          <CommandGroup>
            <CommandItem v-for="option in getTimezones()"
                         :key="option.name"
                         :value="option.name + ' ' + option.formatted"
                         class="gap-2"
                         @select="() => {
                          model = option.name;
                          open = false;
                        }">
              <span class="flex-1 text-sm">{{ option.name }}</span>
              <span class="text-foreground/50 text-sm">({{ getCurrentTimeNow(option.name).toFormat('HH:mm') }}){{
                option.formatted }}</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>
