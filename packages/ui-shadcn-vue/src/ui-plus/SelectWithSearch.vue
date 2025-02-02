<script setup lang="ts">
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { PopoverClose } from "radix-vue";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
defineProps<{
    items: Array<Record<string, any>>;
}>();
</script>

<template>
    <div>
        <Popover>
            <PopoverTrigger>
                <slot name="trigger">
                    <Button variant="outline">
                        Select
                    </Button>
                </slot>
            </PopoverTrigger>
            <PopoverContent>
                <Command>
                    <CommandInput placeholder="Search" />
                    <CommandEmpty>Empty</CommandEmpty>
                    <CommandList>
                        <CommandGroup>
                            <PopoverClose class="w-full">
                                <CommandItem v-for="item in items"
                                             :key="item.key"
                                             :value="item.name + ' ' + item.key"
                                             @select="$emit('select', item)">
                                    {{ item.name }}
                                </CommandItem>
                            </PopoverClose>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    </div>
</template>