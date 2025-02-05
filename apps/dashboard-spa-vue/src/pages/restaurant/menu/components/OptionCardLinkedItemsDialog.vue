<script lang="ts" setup>
import { AlignJustify, Link2, Link2Off } from "lucide-vue-next"
import { Button } from "@/components/ui/button"
import { type LinkedItem, type Option } from "lib/types/menuTypes";
import OptionLinkedItems from "./OptionLinkedItems.vue";
import draggable from "vuedraggable";
import { menuJSON } from "../store";
import { Dialog, DialogScrollContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'


const props = defineProps<{
    option: Option
}>()

const getItemLabel = (linkedItem: LinkedItem) => {
    if (typeof linkedItem === 'string') {
        return menuJSON.value?.allItems?.[linkedItem]?.itemLabel;
    } else {
        if (
            linkedItem &&
            linkedItem.itemId &&
            linkedItem.sizeId
        ) {
            const item = menuJSON.value?.allItems?.[linkedItem.itemId];
            const size = item?.itemSizes?.find(s => s.itemSizeId === linkedItem.sizeId);
            return `${item?.itemLabel}, ${size?.itemSizeLabel}`;
        }
    }
    return "";
}

const removeLinkedItem = (index: number) => {
    if (props.option.linkedItems) {
        props.option.linkedItems.splice(index, 1);
        if (props.option.linkedItems.length === 0) {
            props.option.linkedItems = undefined;
        }
    }
}

const addLinkedItem = (linkedItem: LinkedItem) => {
    console.log("linkedItem");
    console.log(linkedItem);
    // console.log(linkedItem);
    if (!props.option.linkedItems) {
        props.option.linkedItems = [];
    }
    props.option.linkedItems.push(linkedItem);
}

</script>

<template>
    <Dialog>
        <DialogTrigger>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger as-child>
                        <Button variant="outline">
                            <Link2 /> Linked items
                            {{ option.linkedItems ? `(${option.linkedItems.length})` : "" }}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom"
                                    class="max-w-[200px] text-left">
                        Link items to this option to make it a combo
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </DialogTrigger>
        <DialogScrollContent v-if="option">
            <DialogHeader>
                <DialogTitle>Linked items for '{{ option.label || "unlabelled option" }}'</DialogTitle>
            </DialogHeader>
            <div>
                <draggable v-model="option.linkedItems"
                           group="linkedItems"
                           item-key="id"
                           handle=".linked-item-handle"
                           class="space-y-2">
                    <template #item="{ element: linkedItem, index }">
                        <div class="flex items-center justify-between bg-muted p-2 rounded-md">
                            <span class="text-sm line-clamp-1 w-full">
                                {{ getItemLabel(linkedItem) }}
                            </span>
                            <Button variant="ghost"
                                    size="sm"
                                    @click="removeLinkedItem(index)">
                                <Link2Off class="w-4 h-4" />
                            </Button>
                            <AlignJustify class="linked-item-handle w-5 h-5 cursor-move text-muted-foreground" />
                        </div>
                    </template>
                </draggable>
                <OptionLinkedItems @selectedLinkedItem="addLinkedItem($event)" />
            </div>
        </DialogScrollContent>
    </Dialog>
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