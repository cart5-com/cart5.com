<script lang="ts" setup>
import { ref } from "vue";
import {
    Plus
} from "lucide-vue-next";
import draggable from "vuedraggable";
import { Button } from "@/components/ui/button";
import { menuJSON } from "../store";
import CategoryCard from "../components/CategoryCard.vue";
const showCategories = ref(true);

const toggleCategories = () => {
    showCategories.value = !showCategories.value;
}

const addNewCategory = () => {
    const newCatId = `cat-${Date.now()}`
    if (menuJSON.value) {
        if (!menuJSON.value.allCategories) {
            menuJSON.value.allCategories = {}
        }
        menuJSON.value.allCategories[newCatId] = {
            catId: newCatId,
            categoryLabel: `New Category ${Object.keys(menuJSON.value.allCategories).length + 1}`,
            itemIds: []
        }
        if (!menuJSON.value.categoryIdsOrder) {
            menuJSON.value.categoryIdsOrder = []
        }
        menuJSON.value.categoryIdsOrder.push(newCatId)
    }
}
</script>
<template>
    <draggable v-if="menuJSON"
               v-model="menuJSON.categoryIdsOrder"
               group="categories"
               handle=".cat-drag-handle">
        <!-- item-key="catId" -->
        <template #item="{ element: categoryId }">
            <CategoryCard :menuJSON="menuJSON"
                          :categoryId="categoryId"
                          :showCategories="showCategories"
                          :toggleCategories="toggleCategories" />
        </template>
    </draggable>
    <Button class="my-4"
            variant="outline"
            @click="addNewCategory">
        <Plus /> Add New Category
    </Button>
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