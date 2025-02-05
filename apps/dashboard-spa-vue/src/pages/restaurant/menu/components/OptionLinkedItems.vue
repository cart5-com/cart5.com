<script lang="ts" setup>
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-vue-next";
import SelectWithSearch from "@/ui-plus/SelectWithSearch.vue";
import { menuJSON } from "../store";
import { type LinkedItem } from "lib/types/menuTypes";

const getLinkedItemsAndSizes = () => {
    const linkedItemsAndSizes: {
        key: string;
        name: string;
        valueObject: LinkedItem;
    }[] = [];
    if (menuJSON.value) {
        Object.values(menuJSON.value.allItems ?? {}).forEach((item) => {
            if (item.itemSizes && item.itemSizes.length > 0) {
                item.itemSizes.forEach((size) => {
                    if (item.itemId && size.itemSizeId) {
                        linkedItemsAndSizes.push({
                            key: `${item.itemId}_${size.itemSizeId}`,
                            name: `${size.itemSizeLabel ?? "unlabelled size"} | ${item.itemLabel ?? "unlabelled item"}`,
                            valueObject: {
                                itemId: item.itemId,
                                sizeId: size.itemSizeId
                            }
                        });
                    }
                });
            } else {
                if (item.itemId) {
                    linkedItemsAndSizes.push({
                        key: item.itemId,
                        name: item.itemLabel ?? "unlabelled item",
                        valueObject: item.itemId
                    });
                }
            }
        });
    }
    return linkedItemsAndSizes;
}

const isDev = import.meta.env.DEV
</script>
<template>
    <div>
        <details v-if="isDev">
            <summary>JSON</summary>
            <pre>{{ getLinkedItemsAndSizes() }}</pre>
        </details>
        <SelectWithSearch v-if="Object.keys(menuJSON?.allItems ?? {}).length > 0"
                          :items="getLinkedItemsAndSizes()"
                          @select="(item) => {
                            $emit('selectedLinkedItem', item.valueObject as LinkedItem)
                        }">
            <template #trigger>
                <Button variant="outline">
                    <Link2 /> Link new item
                </Button>
            </template>
        </SelectWithSearch>
    </div>
</template>