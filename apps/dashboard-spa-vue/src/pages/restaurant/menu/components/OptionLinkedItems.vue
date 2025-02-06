<script lang="ts" setup>
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-vue-next";
import SelectWithSearch from "@/ui-plus/SelectWithSearch.vue";
import { menuJSON } from "../store";
import { type LinkTypes } from "lib/types/menuTypes";

// function getAvailableItemsWithSizes() {
//     const linkedItemsAndSizes: {
//         key: string;
//         name: string;
//         valueObject: LinkTypes;
//     }[] = [];
//     if (menuJSON.value) {
//         Object.values(menuJSON.value.allItems ?? {}).forEach((item) => {
//             if (item.itemSizes && item.itemSizes.length > 0) {
//                 item.itemSizes.forEach((size) => {
//                     if (item.itemId && size.itemSizeId) {
//                         linkedItemsAndSizes.push({
//                             key: `${item.itemId}_${size.itemSizeId}`,
//                             name: `${size.itemSizeLabel ?? "unlabelled size"} | ${item.itemLabel ?? "unlabelled item"}`,
//                             valueObject: {
//                                 type: "item-size",
//                                 itemId: item.itemId,
//                                 sizeId: size.itemSizeId
//                             }
//                         });
//                     }
//                 });
//             } else {
//                 if (item.itemId) {
//                     linkedItemsAndSizes.push({
//                         key: item.itemId,
//                         name: item.itemLabel ?? "unlabelled item",
//                         valueObject: {
//                             type: "item",
//                             itemId: item.itemId
//                         }
//                     });
//                 }
//             }
//         });
//     }
//     return linkedItemsAndSizes;
// }

const getAvailableOptionGroups = () => {
    return Object.values(menuJSON.value?.allOptionGroups ?? {}).map((optionGroup) => ({
        key: optionGroup.optionGroupId,
        name: optionGroup.optionGroupLabel,
        valueObject: {
            type: "option-group",
            optionGroupId: optionGroup.optionGroupId
        }
    }));
}
</script>
<template>
    <div>
        <!-- 
<SelectWithSearch v-if="Object.keys(menuJSON?.allItems ?? {}).length > 0"
                    :items="getAvailableItemsWithSizes()"
                    @select="(item) => {
                    $emit('selectedLinkedItem', item.valueObject as LinkTypes)
                }">
    <template #trigger>
        <Button variant="outline">
            <Link2 /> Link item
        </Button>
    </template>
</SelectWithSearch>
-->
        <Button variant="outline"
                disabled>
            <Link2 /> Link item
        </Button>

        <SelectWithSearch v-if="Object.keys(menuJSON?.allOptionGroups ?? {}).length > 0"
                          :items="getAvailableOptionGroups()"
                          @select="(item) => {
                            $emit('selectedLinkedItem', item.valueObject as LinkTypes)
                        }">
            <template #trigger>
                <Button variant="outline">
                    <Link2 /> Link option group
                </Button>
            </template>
        </SelectWithSearch>
    </div>
</template>