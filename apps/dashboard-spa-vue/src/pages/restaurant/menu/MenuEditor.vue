<script lang="ts" setup>
import { type Ref } from 'vue'
import { menuRoot } from "./store";
import { useVModel } from '@vueuse/core'
import { BucketItem, type ItemId, type MenuRoot } from 'lib/types/menuType2';
import ItemPreviewDialog from './preview/ItemPreviewDialog.vue';
import { useDialog } from '@/ui-plus/dialog/use-dialog';
import { Button } from '@/components/ui/button';
import { provideMenuOperations } from './composables/useMenuOperations'
import NewCategoryForm from '@src/pages/restaurant/menu/components/NewCategoryForm.vue';
import { Plus } from 'lucide-vue-next';
provideMenuOperations({
    previewItem
})



const dialog = useDialog();

const props = defineProps<{
    modelValue?: MenuRoot;
}>()

const emits = defineEmits<{
    (e: 'update:modelValue', payload: MenuRoot): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
    passive: true,
    defaultValue: menuRoot.value,
    deep: props.modelValue ? false : true,
}) as Ref<typeof props.modelValue>;

function previewItem(itemId: ItemId) {
    dialog.show<BucketItem>({
        // title: menu2Store.value.allItems?.[itemId]?.itemLabel,
        component: ItemPreviewDialog,
        dialogContentClass: "flex h-full min-h-full min-w-full flex-col p-0 md:h-[70vh] md:min-h-[70vh] md:min-w-[60vw] lg:min-w-[40vw]",
        props: {
            itemId: itemId
        },
        onSuccess: async (values) => {
            console.log("success");
            console.log(JSON.stringify(values, null, 2));
        },
    });
}

function addNewCategory() {
    dialog.show<{ name: string }>({
        title: 'Add new category',
        component: NewCategoryForm,
        onSuccess: async (values) => {
            const newCategoryId = `cat-${Date.now()}`
            if (modelValue.value && modelValue.value.allItems) {
                modelValue.value.allItems[newCategoryId] = {
                    itemId: newCategoryId,
                    itemLabel: values.name,
                }
            }
        }
    });
}

</script>

<template>
    <div>
        <div v-for="item in modelValue?.children"
             :key="item"
             class="border rounded-md p-4 mb-4">
            <h3>{{ modelValue?.allItems?.[item]?.itemLabel }}</h3>
            <div v-for="itemId in modelValue?.allItems?.[item]?.children"
                 :key="itemId"
                 class="border rounded-md p-4 cursor-pointer mb-4 bg-card hover:bg-accent"
                 @click="() => {
                    previewItem(itemId)
                }">
                <h4>{{ modelValue?.allItems?.[itemId]?.itemLabel }}</h4>
                <span class="text-sm"
                      v-if="modelValue?.allItems?.[itemId]?.price">${{ modelValue?.allItems?.[itemId]?.price }}</span>
            </div>
        </div>
        <Button variant="outline"
                @click="() => {
                    addNewCategory()
                }">
            <Plus /> Add new category
        </Button>
    </div>
</template>