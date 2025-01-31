<script lang="ts" setup>
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ref } from "vue"
import { menuJSON, currentCategoryId } from "./MenuStore"

const isOpen = ref(false);
// const show = (val: boolean) => {
//     isOpen.value = val
// }
defineExpose({
    isOpen
})
</script>

<template>
    <Dialog v-model:open="isOpen">
        <DialogContent class="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <div class="grid gap-4 py-4">
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label class="text-right">Name</Label>
                    <Input v-if="currentCategoryId"
                           v-model="menuJSON.allCategories[currentCategoryId].categoryLabel"
                           class="col-span-3" />
                </div>
            </div>
        </DialogContent>
    </Dialog>
</template>