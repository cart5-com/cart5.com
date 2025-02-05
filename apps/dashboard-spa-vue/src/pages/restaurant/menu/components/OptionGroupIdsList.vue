<script lang="ts" setup>
import { type Item, type ItemSize } from "lib/types/menuTypes";
import { menuJSON } from "../store";
import { Button } from "@/components/ui/button";
import {
    AlignJustify,
    ChevronUpSquare,
    Link2,
    Link2Off, Pencil, Plus
} from "lucide-vue-next";
import draggable from "vuedraggable";
import SelectWithSearch from "@/ui-plus/SelectWithSearch.vue";
import { useMenuOperations } from '../composables/useMenuOperations';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { onMounted, ref } from "vue";
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

const isCollapsed = ref(true);
onMounted(() => {
    if (props.item?.optionGroupIds?.length) {
        isCollapsed.value = false;
    }
})
</script>

<template>
    <div>
        <div v-if="isCollapsed">
            <Button variant="outline"
                    @click="isCollapsed = false">
                <AlignJustify /> Choices & Addons
            </Button>
        </div>
        <div v-else
             class="border rounded-lg p-4">
            <div class="flex justify-between items-center mb-4 sm:flex-row flex-col gap-2">
                <Button variant="ghost"
                        @click="isCollapsed = true">
                    Choices & Addons
                    <ChevronUpSquare />
                </Button>
                <SelectWithSearch v-if="Object.keys(menuJSON?.allOptionGroups ?? {}).length > 0"
                                  :items="Object.values(menuJSON?.allOptionGroups ?? {}).map((optionGroup) => ({
                                    key: optionGroup.optionGroupId,
                                    name: optionGroup.optionGroupLabel
                                }))"
                                  @select="linkOptionGroup($event.key)">
                    <template #trigger>
                        <Button variant="outline">
                            <Link2 /> Link existing
                        </Button>
                    </template>
                </SelectWithSearch>

                <Button variant="outline"
                        @click="() => {
                            const newOptionGroupId = addNewOptionGroup()
                            linkOptionGroup(newOptionGroupId)
                        }">
                    <Plus /> Add new
                </Button>
            </div>

            <draggable v-if="item && item?.optionGroupIds"
                       v-model="item.optionGroupIds"
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

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger as-child>
                                        <AlignJustify
                                                      class="option-group-drag-handle w-5 h-5 cursor-move text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Drag to reorder option group
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                        </div>
                    </div>
                </template>
            </draggable>
        </div>
    </div>
</template>

<style scoped>
.sortable-chosen {
    border: 1px dashed rgba(var(--primary));
}

.sortable-ghost {
    opacity: 0.5;
    border: 1px dashed rgba(var(--secondary));
}
</style>