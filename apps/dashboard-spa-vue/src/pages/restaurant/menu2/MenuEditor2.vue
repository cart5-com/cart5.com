<script lang="ts" setup>
import { ref, type Ref } from 'vue'
import { menu2Store } from "./store";
import { useVModel } from '@vueuse/core'
import { type ItemId, type RootState } from 'lib/types/menuType2';
import ItemPreviewDialog from './ItemPreviewDialog.vue';

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

const currentItemId = ref<ItemId>();
const previewItemDialog = ref<InstanceType<typeof ItemPreviewDialog>>();
const previewItem = (itemId: ItemId) => {
    currentItemId.value = itemId;
    if (previewItemDialog.value) {
        previewItemDialog.value.resetBucketItem();
        previewItemDialog.value.isOpen = true;
    }
}

</script>

<template>
    <div>
        <h2>Items</h2>
        <div v-for="item in modelValue?.children"
             :key="item"
             class="border rounded-md p-4">
            <h3>{{ modelValue?.allItems?.[item]?.itemLabel }}</h3>
            <div v-for="child in modelValue?.allItems?.[item]?.children"
                 :key="child"
                 class="border rounded-md p-2 cursor-pointer"
                 @click="() => {
                    previewItem(child)
                }">
                <h4>{{ modelValue?.allItems?.[child]?.itemLabel }}</h4>
                <span class="text-sm"
                      v-if="modelValue?.allItems?.[child]?.price">${{ modelValue?.allItems?.[child]?.price }}</span>
            </div>
        </div>
        <ItemPreviewDialog ref="previewItemDialog"
                           :itemId="currentItemId" />
    </div>
</template>