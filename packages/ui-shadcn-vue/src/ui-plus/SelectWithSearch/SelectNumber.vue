<script setup lang="ts">
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { PopoverClose } from "radix-vue";
import { Command, CommandInput, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { computed, ref } from "vue";

const props = defineProps<{
    items: Array<Record<string, any>>;
    btnText?: string;
    min?: number;
}>();

const search = ref("");

const addSearchToItems = computed(() => {
    if (
        search.value &&
        props.items.filter(item => item.name === search.value).length === 0 &&
        Number(search.value) >= Number(props.min)
    ) {
        return [...props.items, {
            name: search.value,
            key: search.value
        }];
    } else {
        return props.items
    }
});
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
        <PopoverContent class="p-1">
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
            <Command v-model:searchTerm="search"
                     class="border">
                <CommandInput v-bind="$attrs"
                              @enter="$emit('select', { name: search, key: search })" />
                <CommandList>
                    <CommandGroup>
                        <PopoverClose class="w-full">
                            <slot name="items-list"
                                  :items="items"
                                  :emit="$emit">
                                <CommandItem v-for="item in addSearchToItems"
                                             :key="item.key"
                                             :value="item.name + ' ' + item.key"
                                             @select="$emit('select', item)">
                                    {{ item.name }}
                                </CommandItem>
                            </slot>
                        </PopoverClose>
                    </CommandGroup>
                </CommandList>
            </Command>
        </PopoverContent>
    </Popover>
</template>