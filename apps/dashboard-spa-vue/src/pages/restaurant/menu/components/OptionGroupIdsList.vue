<script lang="ts" setup>
import { type Item, type ItemSize } from "lib/types/menuTypes";
import { menuJSON } from "../store";
import { Button } from "@/components/ui/button";
import { AlignJustify, Link2, Link2Off, Pencil, Plus } from "lucide-vue-next";
import draggable from "vuedraggable";
import SelectWithSearch from "@/ui-plus/SelectWithSearch.vue";
import { useMenuOperations } from '../composables/useMenuOperations';
const { openOptionGroupDialog, addNewOptionGroup } = useMenuOperations();

const props = defineProps<{
    item?: Item | ItemSize;
}>();

const unlink = (index: number) => {
    if (props.item?.optionGroupIds) {
        props.item.optionGroupIds.splice(index, 1)
        if (props.item.optionGroupIds.length === 0) {
            props.item.optionGroupIds = undefined
        }
    }
}

const linkOptionGroup = (optionGroupId: string) => {
    if (props.item?.optionGroupIds) {
        props.item.optionGroupIds.push(optionGroupId)
    } else {
        if (props.item) {
            props.item.optionGroupIds = [optionGroupId]
        }
    }
}
</script>

<template>
    <div class="border rounded-lg p-4"
         v-if="item">
        <div class="flex justify-between items-center mb-4 sm:flex-row flex-col gap-2">
            <h3 class="font-medium">Option Groups</h3>
            <SelectWithSearch v-if="Object.keys(menuJSON?.allOptionGroups ?? {}).length > 0"
                              :items="Object.values(menuJSON?.allOptionGroups ?? {}).map((optionGroup) => ({
                                key: optionGroup.optionGroupId,
                                name: optionGroup.optionGroupLabel
                            }))"
                              @select="linkOptionGroup($event.key)">
                <template #trigger>
                    <Button variant="outline"
                            size="sm">
                        <Link2 class="w-4 h-4 mr-2" /> Link option group
                    </Button>
                </template>
            </SelectWithSearch>

            <Button variant="outline"
                    size="sm"
                    @click="() => {
                        const newOptionGroupId = addNewOptionGroup()
                        linkOptionGroup(newOptionGroupId)
                    }">
                <Plus class="w-4 h-4 mr-2" /> add new option group
            </Button>
        </div>

        <draggable v-if="props.item && props.item?.optionGroupIds"
                   v-model="props.item.optionGroupIds"
                   group="optionGroupIds"
                   item-key="id"
                   handle=".option-group-drag-handle"
                   class="space-y-2">
            <template #item="{ element: optionGroupId, index }">
                <div class="flex items-center justify-between bg-muted p-2 rounded-md">
                    <span class="text-sm line-clamp-1">
                        {{ menuJSON?.allOptionGroups?.[optionGroupId]?.optionGroupLabel }}
                    </span>
                    <div class="flex items-center gap-2">
                        <Button variant="ghost"
                                size="sm"
                                @click="openOptionGroupDialog(optionGroupId)">
                            <Pencil class="w-4 h-4" />
                        </Button>
                        <Button variant="ghost"
                                size="sm"
                                @click="unlink(index)">
                            <Link2Off class="w-4 h-4" />
                        </Button>
                        <AlignJustify class="option-group-drag-handle w-5 h-5 cursor-move text-muted-foreground" />
                    </div>
                </div>
            </template>
        </draggable>
    </div>
</template>

<style scoped>
.sortable-chosen {
    @apply border-primary/50;
}

.sortable-ghost {
    @apply opacity-50 border-secondary/50;
}
</style>