<script lang="ts" setup>
import { Dialog, DialogScrollContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Item } from "lib/types/menuTypes"
import { ref } from "vue"
import ItemPropsDialog from "./ItemPropsDialog.vue"

defineProps<{
    item?: Item
}>()

const isOpen = ref(false);

defineExpose({
    isOpen
})
</script>

<template>
    <Dialog v-model:open="isOpen">
        <DialogScrollContent class="sm:max-w-[625px]"
                             v-if="item">
            <DialogHeader>
                <DialogTitle>Edit Item</DialogTitle>
            </DialogHeader>
            <div class="grid gap-4 py-4">
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label class="text-right">Name</Label>
                    <Input v-model="item.itemLabel"
                           class="col-span-3" />
                </div>

                <div class="grid grid-cols-4 items-center gap-4">
                    <Label class="text-right">Description</Label>
                    <Textarea v-model="item.description"
                              class="col-span-3" />
                </div>

                <div class="grid grid-cols-4 items-center gap-4">
                    <Label class="text-right">Price</Label>
                    <Input v-model="item.price"
                           type="number"
                           step="0.01"
                           class="col-span-3" />
                </div>

                <!-- <div class="grid grid-cols-4 items-center gap-4">
                    <Label class="text-right">Image URL</Label>
                    <Input v-model="item.imageUrl"
                           class="col-span-3" />
                </div> -->


                <ItemPropsDialog :item="item" />




            </div>

            <details class="mt-4">
                <summary>Debug: Item JSON</summary>
                <pre class="text-xs">{{ item }}</pre>
            </details>
        </DialogScrollContent>
    </Dialog>
</template>