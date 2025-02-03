<script lang="ts" setup>
import { Dialog, DialogScrollContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import DateTimePropEditor from "@/ui-plus/date-time-prop-editor/DateTimePropEditor.vue"
import { ADDITIVES, ALLERGENS, Item, ITEM_LABELS } from "lib/types/menuTypes"
import StringArraySelector from "@/ui-plus/string-array-selector/StringArraySelector.vue"
import { ref } from "vue"

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
                    <Label class="text-right">Internal Name</Label>
                    <Input v-model="item.internalName"
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

                <div class="w-full border rounded-md p-4">
                    <StringArraySelector v-model="item.itemLabels"
                                         :available-options="ITEM_LABELS"
                                         placeholder="Add label" />
                </div>

                <div class="w-full border rounded-md p-4">
                    <StringArraySelector v-model="item.allergens"
                                         :available-options="ALLERGENS"
                                         placeholder="Add allergen" />
                </div>

                <div class="w-full border rounded-md p-4">
                    <StringArraySelector v-model="item.additives"
                                         :available-options="ADDITIVES"
                                         placeholder="Add additive" />
                </div>

                <div class="grid grid-cols-4 items-start gap-4 border rounded-md p-4">
                    <Label class="text-right">Out of Stock</Label>
                    <div class="col-span-3">
                        <DateTimePropEditor v-model="item.isOutOfStock" />
                    </div>
                </div>

                <!-- You can add more fields here for:
                     - itemLabels (multiselect)
                     - ingredients (multiselect)
                     - allergens (multiselect)
                     - additives (multiselect)
                     - itemSizes (complex nested form)
                     - etc.
                -->
            </div>

            <details class="mt-4">
                <summary>Debug: Item JSON</summary>
                <pre class="text-xs">{{ item }}</pre>
            </details>
        </DialogScrollContent>
    </Dialog>
</template>