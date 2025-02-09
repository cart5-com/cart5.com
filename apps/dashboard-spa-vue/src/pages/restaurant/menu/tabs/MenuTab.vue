<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { menuRoot } from "../store";
import { useDialog } from '@/ui-plus/dialog/use-dialog';
import CategoryNewForm from '../components/category/CategoryNewForm.vue';
import { Plus } from "lucide-vue-next";
import draggable from "vuedraggable"
import CategoryCard from "../components/category/CategoryCard.vue";
import { ref } from "vue";
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
            const newCategoryId = `cat-${Date.now()}`
            if (menuRoot.value && menuRoot.value.allItems) {
                menuRoot.value.allItems[newCategoryId] = {
                    itemId: newCategoryId,
                    itemLabel: values.name,
                }
                menuRoot.value.children?.push(newCategoryId)
            }
        }
    });
}
</script>

<template>
    <div>
        <draggable v-if="menuRoot"
                   v-model="menuRoot.children"
                   item-key="itemId"
                   group="main-items"
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
