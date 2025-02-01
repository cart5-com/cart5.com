<script lang="ts" setup>
import { ref } from "vue";
import {
    Plus
} from "lucide-vue-next";
import draggable from "vuedraggable";
import { Button } from "@/components/ui/button";
import type { MenuJSON } from "lib/types/menuTypes";
import CategoryCard from "../cards/CategoryCard.vue";
const showCategories = ref(true);

const toggleCategories = () => {
    showCategories.value = !showCategories.value;
}

defineProps<{
    menuJSON: MenuJSON,
    openCategoryDialog: (categoryId: string) => void,
    addNewCategory: () => void,
    addNewItem: (categoryId: string) => void
}>()
</script>
<template>
    <draggable v-if="menuJSON"
               v-model="menuJSON.categoryIdsOrder"
               group="categories"
               handle=".cat-drag-handle"
               item-key="catId">
        <template #item="{ element: categoryId }">
            <CategoryCard :menuJSON="menuJSON"
                          :categoryId="categoryId"
                          :openCategoryDialog="openCategoryDialog"
                          :showCategories="showCategories"
                          :toggleCategories="toggleCategories"
                          :addNewItem="addNewItem" />
        </template>
    </draggable>
    <Button class="my-4"
            variant="outline"
            @click="addNewCategory">
        <Plus /> Add New Category
    </Button>
</template>