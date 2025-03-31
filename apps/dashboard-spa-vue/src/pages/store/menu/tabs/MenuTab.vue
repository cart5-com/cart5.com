<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { menuRoot } from "../MenuRootStore";
import { useDialog } from '@/ui-plus/dialog/use-dialog';
import CategoryNewForm from '../components/CategoryNewForm.vue';
import { Plus } from "lucide-vue-next";
import draggable from "vuedraggable"
import CategoryCard from "../components/CategoryCard.vue";
import { ref } from "vue";
import { createNewItem } from "../helpers";
const dialog = useDialog();
const showCategories = ref(true);

const toggleCategories = () => {
    showCategories.value = !showCategories.value;
}

function addNewCategory() {
    dialog.show<{ name: string }>({
        title: 'Add new category',
        component: CategoryNewForm,
        onSuccess: async (values) => {
            const newCategoryId = createNewItem('ct', { lbl: values.name }, undefined);
            menuRoot.value.children?.push(newCategoryId)
        }
    });
}
</script>

<template>
    <div>
        <draggable v-if="menuRoot"
                   v-model="menuRoot.children"
                   item-key="id"
                   group="root-category-items"
                   handle=".cat-drag-handle">
            <template #item="{ element: itemId }">
                <CategoryCard :itemId="itemId"
                              :showCategories="showCategories"
                              :toggleCategories="toggleCategories" />
            </template>
        </draggable>
        <Button variant="outline"
                @click="() => {
                    addNewCategory()
                }">
            <Plus /> Add new category
        </Button>
    </div>
</template>
