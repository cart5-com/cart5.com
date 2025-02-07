<script lang="ts" setup>
import { type Ref } from 'vue'
import { menu2Store } from "./store";
import { useVModel } from '@vueuse/core'
import { BucketItem, type ItemId, type RootState } from 'lib/types/menuType2';
import ItemPreviewDialog from './ItemPreviewDialog.vue';
import { useDialog } from '@/ui-plus/dialog/use-dialog';
const dialog = useDialog();

const props = defineProps<{
    modelValue?: RootState;
}>()

const emits = defineEmits<{
    (e: 'update:modelValue', payload: RootState): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
    passive: true,
    defaultValue: menu2Store.value,
    deep: props.modelValue ? false : true,
}) as Ref<typeof props.modelValue>;

const previewItem = (itemId: ItemId) => {
    dialog.show<BucketItem>({
        title: menu2Store.value.allItems?.[itemId]?.itemLabel,
        component: ItemPreviewDialog,
        dialogContentClass: "flex h-full min-h-full min-w-full flex-col p-0 sm:p-2 md:h-[70vh] md:min-h-[70vh] md:min-w-[80vw] lg:min-w-[50vw]",
        props: {
            itemId: itemId
        },
        onCancel: async () => {
            console.log("cancel");
        },
        onSuccess: async (values) => {
            console.log("success");
            console.log(JSON.stringify(values, null, 2));
        },
        onError: async (error: any) => {
            console.log("error");
            console.log(error);
        }
    });
}

</script>

<template>
    <div>
        <h2>Items</h2>
        <div v-for="item in modelValue?.children"
             :key="item"
             class="border rounded-md p-4">
            <h3>{{ modelValue?.allItems?.[item]?.itemLabel }}</h3>
            <div v-for="itemId in modelValue?.allItems?.[item]?.children"
                 :key="itemId"
                 class="border rounded-md p-2 cursor-pointer"
                 @click="() => {
                    previewItem(itemId)
                }">
                <h4>{{ modelValue?.allItems?.[itemId]?.itemLabel }}</h4>
                <span class="text-sm"
                      v-if="modelValue?.allItems?.[itemId]?.price">${{ modelValue?.allItems?.[itemId]?.price }}</span>
            </div>
        </div>
    </div>
</template>