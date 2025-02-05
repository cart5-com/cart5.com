<script lang="ts" setup>
import { type LinkedItem } from "lib/types/menuTypes";
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-vue-next";
import SelectWithSearch from "@/ui-plus/SelectWithSearch.vue";
import { menuJSON } from "../store";


const getLinkedItemsAndSizes = () => {
    const linkedItemsAndSizes: LinkedItem[] = [];
    if (menuJSON.value) {
        Object.values(menuJSON.value.allItems ?? {}).forEach((item) => {
            if (item.itemSizes && item.itemSizes.length > 0) {
                item.itemSizes.forEach((size) => {
                    if (item.itemId && size.itemSizeId) {
                        linkedItemsAndSizes.push({
                            itemId: item.itemId,
                            sizeId: size.itemSizeId
                        });
                    }
                });
            } else {
                if (item.itemId) {
                    linkedItemsAndSizes.push(item.itemId);
                }
            }
        });
    }
    return linkedItemsAndSizes.map((item) => {
        if (!item) {
            return undefined;
        }
        if (typeof item === "string") {
            return {
                key: item,
                name: menuJSON.value?.allItems?.[item]?.itemLabel
            };
        } else {
            return {
                key: `ITEMID_${item.itemId}_SIZEID_${item.sizeId}`,
                // name: menuJSON.value?.allItems?.[item.itemId]?.itemLabel + ", " + menuJSON.value?.allItems?.[item.itemId]?.itemSizes?.find((size) => size.itemSizeId === item.sizeId)?.itemSizeLabel
                name: `${menuJSON.value?.allItems?.[item.itemId]?.itemLabel}, ${menuJSON.value?.allItems?.[item.itemId]?.itemSizes?.find((size) => size.itemSizeId === item.sizeId)?.itemSizeLabel}`,
                itemId: item.itemId,
                sizeId: item.sizeId
            };
        }
    }).filter((item) => item !== undefined);
}
</script>
<template>
    <SelectWithSearch v-if="Object.keys(menuJSON?.allItems ?? {}).length > 0"
                      :items="getLinkedItemsAndSizes()"
                      @select="(item) => {
                        // addItemToCategory(categoryId, item.key)
                        console.log(item)
                    }">
        <template #trigger>
            <Button variant="outline">
                <Link2 /> Link item
            </Button>
        </template>
    </SelectWithSearch>
</template>