<script setup lang="ts">
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { PopoverClose } from "radix-vue";
import { Command, CommandInput, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { ref } from "vue";

defineProps<{
    items: Array<Record<string, any>>;
    searchPlaceholder?: string;
    btnText?: string;
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
        <PopoverContent>
            <Command v-model:searchTerm="search"
                     class="border">
                <CommandInput :placeholder="searchPlaceholder"
                              type="number" />
                <CommandList>
                    <CommandGroup>
                        <PopoverClose class="w-full">
                            <slot name="items-list"
                                  :items="items"
                                  :emit="$emit">
                                <CommandItem v-for="item in items"
                                             :key="item.key"
                                             :value="item.name + ' ' + item.key"
                                             @select="$emit('select', item)">
                                    {{ item.name }}
                                </CommandItem>
                                <CommandItem v-if="search.length > 0"
                                             :value="search"
                                             @select="$emit('select', { name: search, key: search })">
                                    {{ search }}
                                </CommandItem>
                            </slot>
                        </PopoverClose>
                    </CommandGroup>
                </CommandList>
            </Command>
            <slot name="new-button"
                  :search="search">
                <PopoverClose class="w-full">
                    <Button variant="outline"
                            class="w-full"
                            @click="$emit('select', { name: btnText, key: 0 })">
                        {{ btnText }}
                    </Button>
                </PopoverClose>
            </slot>
        </PopoverContent>
    </Popover>
</template>