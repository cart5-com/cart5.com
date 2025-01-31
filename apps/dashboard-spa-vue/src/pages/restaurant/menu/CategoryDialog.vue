<script lang="ts" setup>
import { Dialog, DialogScrollContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import DateTimePropEditor from "@/ui-plus/date-time-prop-editor/DateTimePropEditor.vue"
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
        <DialogScrollContent class="sm:max-w-[425px]"
                             v-if="currentCategoryId">
            <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <div>
                <details>
                    <summary>JSON</summary>
                    <pre>{{ menuJSON?.allCategories?.[currentCategoryId] }}</pre>
                </details>
                <div class="grid gap-4 py-4">
                    <div class="grid grid-cols-4 items-center gap-4">
                        <Label class="text-right">Name</Label>
                        <Input v-model="menuJSON.allCategories[currentCategoryId].categoryLabel"
                               class="col-span-3" />
                    </div>
                    <DateTimePropEditor v-model="menuJSON.allCategories[currentCategoryId].isLimitedTime" />
                </div>
            </div>
        </DialogScrollContent>
    </Dialog>
</template>