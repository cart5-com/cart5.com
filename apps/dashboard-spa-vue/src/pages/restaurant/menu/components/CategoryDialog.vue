<script lang="ts" setup>
import { Dialog, DialogScrollContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { type Category } from "lib/types/menuTypes"
import { ref } from "vue"

defineProps<{
    category?: Category
}>()

const isOpen = ref(false);
// const show = (val: boolean) => {
//     isOpen.value = val
// }
defineExpose({
    isOpen
})

const isDev = import.meta.env.DEV
</script>

<template>
    <Dialog v-model:open="isOpen">
        <DialogScrollContent class="sm:max-w-[425px]"
                             v-if="category">
            <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <div>
                <details v-if="isDev">
                    <summary>JSON</summary>
                    <pre>{{ category }}</pre>
                </details>
                <div class="grid gap-4 py-4">
                    <div class="grid grid-cols-4 items-center gap-4">
                        <Label class="text-right">Name</Label>
                        <Input v-model="category.categoryLabel"
                               class="col-span-3" />
                    </div>
                </div>
            </div>
        </DialogScrollContent>
    </Dialog>
</template>