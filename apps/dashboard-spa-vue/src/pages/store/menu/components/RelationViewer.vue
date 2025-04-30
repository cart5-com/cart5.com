<script lang="ts" setup>
import { computed } from "vue";
import { menuRoot } from "../MenuRootStore";
import { type ItemId } from "@lib/zod/menuRootSchema";
import SelectWithSearch from "@/ui-plus/SelectWithSearch/SelectWithSearch.vue";
import { CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Eye } from "lucide-vue-next";
import HoverItem from '../components/hover/HoverItem.vue';
import HoverCustomizationCard from '../components/hover/HoverCustomizationCard.vue';

const props = defineProps<{
    itemId: ItemId,
    name?: string
}>()

const getItemWhoHasThisItemAsChild = computed(() => {
    return Object.values(menuRoot.value.allItems ?? {})
        .filter(item => item.cIds?.includes(props.itemId))
})

</script>

<template>
    <div v-if="getItemWhoHasThisItemAsChild.length > 1">

        <SelectWithSearch :items="getItemWhoHasThisItemAsChild
            .map(item => ({
                key: item.id,
                name: item.lbl,
                type: item.t
            }))"
                          :has-new-button="false">

            <template #trigger>
                <div class="text-xs text-left">
                    <span class="font-medium">⚠️ Shared {{ name || 'item' }}:</span>
                    This {{ name || 'item' }} appears in {{ getItemWhoHasThisItemAsChild.length }} other places.
                    Any changes you make here will affect all instances.
                </div>
            </template>

            <template #items-list="{ items }">
                <CommandItem v-for="item in items"
                             :key="item.key"
                             :value="item.name + ' ' + item.key"
                             @click.stop>
                    <div class="flex justify-between w-full">
                        <div @click.stop
                             class="w-full">
                            {{ item.name }}
                        </div>
                        <div v-if="item.type !== 'ct'">
                            <Popover>
                                <PopoverTrigger as-child>
                                    <Eye @click.stop />
                                </PopoverTrigger>
                                <PopoverContent class="w-80 border border-card-foreground"
                                                align="start">
                                    <div class="max-h-80 overflow-y-auto">
                                        <HoverItem :item-id="item.key"
                                                   v-if="item.type === 'i' || item.type === 'o'" />
                                        <HoverCustomizationCard :item-id="item.key"
                                                                v-if="item.type === 'c'" />
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </CommandItem>
            </template>

        </SelectWithSearch>



    </div>
</template>