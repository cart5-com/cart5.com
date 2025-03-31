<script lang="ts" setup>
import { menuRoot } from "../MenuRootStore";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2Off, MoveIcon, Pencil } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { computed } from "vue";
import { previewItem } from "../helpers";

const props = defineProps<{
    itemId: string,
    categoryId?: string,
    hideMoveIcon?: boolean,
}>()

const currentItem = computed(() => {
    return menuRoot.value?.allItems?.[props.itemId]
})


const unlinkItem = () => {
    if (!props.categoryId || !menuRoot.value?.allItems?.[props.categoryId]) return;

    const category = menuRoot.value?.allItems?.[props.categoryId];
    if (!category.cIds) return;

    const index = category.cIds.indexOf(props.itemId);
    if (index > -1) {
        category.cIds.splice(index, 1);
    }
}


</script>

<template>
    <div class="flex bg-card rounded-lg overflow-hidden border">
        <Card class="flex-grow border-none">
            <CardHeader>
                <CardTitle class="flex items-center gap-2">
                    <div v-if="!hideMoveIcon"
                         class="item-drag-handle cursor-grab active:cursor-grabbing"
                         style="touch-action: none">
                        <MoveIcon class="cursor-move" />
                    </div>
                    <h1 class="text-lg font-bold capitalize">
                        {{ currentItem?.lbl }}
                    </h1>
                </CardTitle>
                <CardDescription>
                    {{ currentItem?.prc }}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p class="text-xs line-clamp-3">
                    {{ currentItem?.dsc }}
                </p>
            </CardContent>
            <CardFooter class="max-w-full gap-2 flex flex-wrap">
                <Button variant="outline"
                        size="sm"
                        @click="previewItem(itemId)">
                    <Pencil /> Edit
                </Button>
                <Button variant="destructive"
                        size="sm"
                        title="Unlink from category"
                        @click="unlinkItem"
                        v-if="categoryId">
                    <Link2Off /> Unlink
                </Button>
            </CardFooter>
        </Card>

        <!-- <div class="flex-shrink-0"
             v-if="currentItem?.imgUrl">
            <div class="flex items-center justify-center h-full">
                <img :src="currentItem?.imgUrl"
                     :alt="currentItem?.lbl"
                     loading="lazy"
                     class="h-full w-48 object-cover overflow-hidden" />
            </div>
        </div> -->
    </div>
</template>