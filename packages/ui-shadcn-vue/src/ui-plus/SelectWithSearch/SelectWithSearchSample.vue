<script setup lang="ts">
import SelectWithSearch from './SelectWithSearch.vue';
import { Eye, Plus } from 'lucide-vue-next';
import { CommandItem } from '@/components/ui/command';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '@/components/ui/hover-card'
</script>

<template>
    <SelectWithSearch :items="[
        { key: '1', name: 'Item 1' },
        { key: '2', name: 'Item 2' },
        { key: '3', name: 'Item 3' },
        { key: '4', name: 'Item 4' },
        { key: '5', name: 'Item 5' },
    ]"
                      @select="(item: any) => { console.log(item) }"
                      @create-new="(search: string) => { console.log('search', search) }"
                      :has-new-button="true">
        <!-- <template #new-button="{ search }">
                <Button variant="outline"
                        class="w-full"
                        @click="() => { console.log('search', search) }">
                    New category
                </Button>
            </template> -->
        <template #items-list="{ items, emit }">
            <CommandItem v-for="item in items"
                         :key="item.key"
                         :value="item.name + ' ' + item.key"
                         @select="emit('select', item)">
                <div class="flex justify-between w-full">
                    <div>
                        {{ item.name }}
                    </div>
                    <div>
                        <HoverCard>
                            <HoverCardTrigger>
                                <Eye />
                            </HoverCardTrigger>
                            <HoverCardContent class="w-80">
                                <ItemPreviewDialog :item-id="item.key" />
                            </HoverCardContent>
                        </HoverCard>
                    </div>
                </div>
            </CommandItem>




        </template>

        <template #trigger>
            <Button variant="outline">
                <Plus /> Add new category
            </Button>
        </template>
    </SelectWithSearch>
</template>