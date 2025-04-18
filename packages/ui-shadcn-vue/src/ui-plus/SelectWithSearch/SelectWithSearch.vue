<script setup lang="ts">
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { PopoverClose } from "radix-vue";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { ref } from "vue";

defineProps<{
    items: Array<Record<string, any>>;
    hasNewButton?: boolean;
    heading?: string;
}>();

const search = ref("");
</script>

<template>
    <Popover>
        <PopoverTrigger>
            <slot name="trigger">
                <Button variant="outline">
                    Select
                </Button>
            </slot>
        </PopoverTrigger>
        <PopoverContent class="p-1"
                        align="start">
            <Command v-model:searchTerm="search"
                     class="border">
                <CommandInput placeholder="Search" />
                <CommandEmpty>not found</CommandEmpty>
                <CommandList>
                    <CommandGroup :heading="heading">
                        <slot name="items-list"
                              :items="items"
                              :emit="$emit">
                            <PopoverClose class="w-full">
                                <CommandItem v-for="item in items"
                                             :key="item.key"
                                             :value="item.name + ' ' + item.key"
                                             @select="$emit('select', item)">
                                    <span class="capitalize">
                                        {{ item.name }}
                                    </span>
                                </CommandItem>
                            </PopoverClose>
                        </slot>
                    </CommandGroup>
                </CommandList>
            </Command>
            <slot name="new-button"
                  :search="search">
                <PopoverClose class="w-full"
                              v-if="hasNewButton">
                    <Button variant="outline"
                            class="w-full"
                            @click="$emit('create-new', search ? search.toString().trim() : undefined)">
                        Create New
                    </Button>
                </PopoverClose>
            </slot>
        </PopoverContent>
    </Popover>
</template>