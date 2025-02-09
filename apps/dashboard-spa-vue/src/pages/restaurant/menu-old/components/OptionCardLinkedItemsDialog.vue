<script lang="ts" setup>
import { AlignJustify, Link2, Link2Off } from "lucide-vue-next"
import { Button } from "@/components/ui/button"
import { type LinkTypes, type Option } from "lib/types/menuTypes-old";
import OptionLinkedItems from "./OptionLinkedItems.vue";
import draggable from "vuedraggable";
import { menuJSON } from "../store";
import { Dialog, DialogScrollContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'


const props = defineProps<{
    option: Option
}>()

const getItemLabel = (linkedItem: LinkTypes) => {
    if (typeof linkedItem === 'string') {
        return menuJSON.value?.allItems?.[linkedItem]?.itemLabel;
    } else {
        if (
            linkedItem &&
            linkedItem.type
        ) {
            if (
                linkedItem.type === "option-group" &&
                linkedItem.optionGroupId
            ) {
                return menuJSON.value?.allOptionGroups?.[linkedItem.optionGroupId]?.optionGroupLabel;
                // }else if (
                //     linkedItem.type === "item" &&
                //     linkedItem.itemId
                // ) {
                //     return menuJSON.value?.allItems?.[linkedItem.itemId]?.itemLabel;
                // } else if (
                //     linkedItem.type === "item-size" &&
                //     linkedItem.itemId &&
                //     linkedItem.sizeId
                // ) {
                //     const item = menuJSON.value?.allItems?.[linkedItem.itemId];
                //     const size = item?.itemSizes?.find(s => s.itemSizeId === linkedItem.sizeId);
                //     return `${size?.itemSizeLabel} | ${item?.itemLabel}`;
            }
        }
    }
    return "";
}

const removeLinkedItem = (index: number) => {
    if (props.option.optionLinks) {
        props.option.optionLinks.splice(index, 1);
        if (props.option.optionLinks.length === 0) {
            props.option.optionLinks = undefined;
        }
    }
}

const addLinkedItem = (linkedItem: LinkTypes) => {
    console.log("linkedItem");
    console.log(linkedItem);
    // console.log(linkedItem);
    if (!props.option.optionLinks) {
        props.option.optionLinks = [];
    }
    props.option.optionLinks.push(linkedItem);
}

</script>

<template>
    <Dialog>
        <DialogTrigger>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger as-child>
                        <Button variant="outline">
                            <Link2 /> Linked items or option groups
                            {{ option.optionLinks ? `(${option.optionLinks.length})` : "" }}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom"
                                    class="max-w-[200px] text-left">
                        Link option groups to ask same choices or
                        link items to make it a combo
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </DialogTrigger>
        <DialogScrollContent v-if="option">
            <DialogHeader>
                <DialogTitle>
                    Linked items for '{{ option.label || "unlabelled option" }}'
                </DialogTitle>
                <DialogDescription>
                    Link option groups to ask same choices or
                    link items to make it a combo
                </DialogDescription>
            </DialogHeader>
            <div>
                <draggable v-model="option.optionLinks"
                           item-key="optionGroupId"
                           group="linkedItems"
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