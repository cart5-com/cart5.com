<script lang="ts" setup>
import { MenuJSON } from "lib/types/menuTypes";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MoveIcon } from "lucide-vue-next";

defineProps<{
    menuJSON: MenuJSON,
    itemId: string
}>()

</script>

<template>
    <div class="flex bg-card rounded-lg overflow-hidden border">
        <Card class="flex-grow border-none">
            <CardHeader>
                <CardTitle class="flex items-center gap-2">
                    <div class="item-drag-handle cursor-grab active:cursor-grabbing"
                         style="touch-action: none">
                        <MoveIcon />
                    </div>
                    <h1 class="text-lg font-bold">
                        {{ menuJSON?.allItems?.[itemId]?.itemLabel }}
                    </h1>
                    <!-- <Input :model-value="itemsMap.get(itemId)?.itemLabel"
                                                       @update:model-value="(
                                                        newValue: string | number
                                                    ) => {
                                                        const item = itemsMap.get(itemId);
                                                        if (item) {
                                                            item.itemLabel = newValue.toString();
                                                        }
                                                    }"
                                                       type="text" /> -->
                </CardTitle>
                <CardDescription>
                    ${{ menuJSON?.allItems?.[itemId]?.price?.toFixed(2) }}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p class="text-xs line-clamp-3">
                    {{ menuJSON?.allItems?.[itemId]?.description }}
                </p>
            </CardContent>
            <CardFooter>
                <!-- <Button class="w-full">Add to Cart</Button> -->
            </CardFooter>
        </Card>

        <div class="flex-shrink-0"
             v-if="menuJSON?.allItems?.[itemId]?.imageUrl">
            <div class="flex items-center justify-center h-full">
                <img :src="menuJSON?.allItems?.[itemId]?.imageUrl"
                     :alt="menuJSON?.allItems?.[itemId]?.itemLabel"
                     loading="lazy"
                     class="h-full w-48 object-cover overflow-hidden" />
            </div>
        </div>
    </div>
</template>