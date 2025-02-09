<script lang="ts" setup>
import { menuRoot } from "../../store";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Link2Off, MoveIcon, Pencil } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { useMenuOperations } from '../../composables/useMenuOperations';
import { computed } from "vue";

const { editItem, previewItem } = useMenuOperations()

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
    if (!category.children) return;

    const index = category.children.indexOf(props.itemId);
    if (index > -1) {
        category.children.splice(index, 1);
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
                    <h1 class="text-lg font-bold">
                        {{ currentItem?.itemLabel }}
                    </h1>
                </CardTitle>
                <CardDescription>
                    ${{ currentItem?.price }}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p class="text-xs line-clamp-3">
                    {{ currentItem?.description }}
                </p>
            </CardContent>
            <CardFooter class="flex gap-2">
                <Button variant="outline"
                        size="sm"
                        @click="editItem(itemId)">
                    <Pencil /> Edit
                </Button>
                <Button variant="outline"
                        size="sm"
                        @click="previewItem(itemId)">
                    <Eye /> Preview
                </Button>
                <Button variant="destructive"
                        size="sm"
                        @click="unlinkItem"
                        v-if="categoryId">
                    <Link2Off /> Unlink
                </Button>
            </CardFooter>
        </Card>

        <div class="flex-shrink-0"
             v-if="currentItem?.imageUrl">
            <div class="flex items-center justify-center h-full">
                <img :src="currentItem?.imageUrl"
                     :alt="currentItem?.itemLabel"
                     loading="lazy"
                     class="h-full w-48 object-cover overflow-hidden" />
            </div>
        </div>
    </div>
</template>