<script lang="ts" setup>
import { MenuJSON } from "lib/types/menuTypes";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2Off, MoveIcon, Pencil } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { useMenuOperations } from '../composables/useMenuOperations';
const { openItemDialog } = useMenuOperations()

const props = defineProps<{
    menuJSON: MenuJSON,
    itemId: string,
    categoryId?: string,
}>()


const unlinkItem = () => {
    if (!props.categoryId || !props.menuJSON.allCategories?.[props.categoryId]) return;

    const category = props.menuJSON.allCategories[props.categoryId];
    if (!category.itemIds) return;

    const index = category.itemIds.indexOf(props.itemId);
    if (index > -1) {
        category.itemIds.splice(index, 1);
    }
}

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
                <Button variant="outline"
                        size="sm"
                        @click="openItemDialog(itemId)">
                    <Pencil />
                </Button>
                <Button variant="destructive"
                        size="sm"
                        @click="unlinkItem"
                        v-if="categoryId">
                    <Link2Off />
                </Button>
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