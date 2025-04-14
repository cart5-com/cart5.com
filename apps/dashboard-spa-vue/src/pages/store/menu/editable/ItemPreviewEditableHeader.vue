<script setup lang="ts">
import { Item } from "@lib/zod/menuRootSchema";
import { Banknote } from "lucide-vue-next";
import InputInline from "@/ui-plus/inline-edit/InputInline.vue";
import TextareaInline from "@/ui-plus/inline-edit/TextareaInline.vue";
import { taxSettings } from "../TaxSettingsStore";
import ItemTaxInput from "@/ui-plus/inline-edit/ItemTaxInput.vue";
import { Input } from "@/components/ui/input";

defineProps<{
    currentItem?: Item
}>()


</script>

<template>
    <div class="space-y-4"
         v-if="currentItem">

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
                     @update:modelValue="(val: any) => {
                        if (val === '' && currentItem) {
                            currentItem.prc = undefined;
                        }
                    }"
                     v-model="currentItem.prc">
            <template #trigger>
                <div class="cursor-text flex">
                    <Banknote class="mr-2" /> {{ currentItem.prc || 'Price:' }}
                </div>
            </template>
            <template #content>
                <details class="mt-8"
                         :open="currentItem.pickupPrc !== undefined">
                    <summary class="text-sm font-medium">custom pickup price</summary>
                    <div class="mt-2">
                        currentItem.pickupPrc:{{ currentItem.pickupPrc }}
                        <Input v-model="currentItem.pickupPrc"
                               type="number"
                               @update:modelValue="(val: any) => {
                                if (val === '' && currentItem) {
                                    currentItem.pickupPrc = undefined;
                                }
                            }"
                               placeholder="Pickup Price:" />
                        <p class="text-xs">
                            If no pickup price is set, the price({{ currentItem.prc }}) will be used for both delivery
                            and pickup.
                        </p>
                    </div>
                </details>
            </template>
        </InputInline>


        <ItemTaxInput v-model="currentItem.taxCatId"
                      :tax-categories="taxSettings?.taxCategories ?? []"
                      @update:model-value="(val) => {
                        console.log('val', val);
                    }" />

    </div>
</template>