<script setup lang="ts">
import { Item } from "@lib/types/menuType";
import { DollarSign } from "lucide-vue-next";
import InputInline from "@/ui-plus/inline-edit/InputInline.vue";
import TextareaInline from "@/ui-plus/inline-edit/TextareaInline.vue";

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
                     placeholder="Price: $"
                     v-model="currentItem.prc">
            <template #trigger>
                <div class="cursor-text flex">
                    <DollarSign /> {{ currentItem.prc || 'Price:' }}
                </div>
            </template>
        </InputInline>

    </div>
</template>