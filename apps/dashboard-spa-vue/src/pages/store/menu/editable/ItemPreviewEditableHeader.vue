<script setup lang="ts">
import { Item } from "@lib/types/menuType";
import { Banknote } from "lucide-vue-next";
import InputInline from "@/ui-plus/inline-edit/InputInline.vue";
import TextareaInline from "@/ui-plus/inline-edit/TextareaInline.vue";
import { taxSettings } from "../store";
import ItemTaxInput from "@/ui-plus/inline-edit/ItemTaxInput.vue";
defineProps<{
    currentItem?: Item
}>()


</script>

<template>
    <div class="space-y-4"
         v-if="currentItem">

        <details>
            <summary>tax</summary>
            <pre>{{ taxSettings }}</pre>
        </details>
        <details>
            <summary>item</summary>
            <pre>{{ currentItem }}</pre>
        </details>

        <InputInline v-model="currentItem.lbl"
                     placeholder="Name:">
            <template #trigger>
                <span class="capitalize cursor-text text-2xl font-bold">
                    {{ currentItem.lbl || 'Name:' }}
                </span>
            </template>
        </InputInline>

        <TextareaInline v-model="currentItem.dsc"
                        placeholder="Description">
            <template #trigger>
                <span class="capitalize cursor-text line-clamp-3">
                    {{ currentItem.dsc || 'Description:' }}
                </span>
            </template>
        </TextareaInline>


        <InputInline type="number"
                     placeholder="Price:"
                     v-model="currentItem.prc">
            <template #trigger>
                <div class="cursor-text flex">
                    <Banknote class="mr-2" /> {{ currentItem.prc || 'Price:' }}
                </div>
            </template>
        </InputInline>

        <ItemTaxInput v-model="currentItem.taxCatId"
                      :tax-categories="taxSettings.taxCategories"
                      @update:model-value="(val) => {
                        console.log('val', val);
                    }" />

    </div>
</template>