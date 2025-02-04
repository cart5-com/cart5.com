<script lang="ts" setup>
import { ItemSize } from "lib/types/menuTypes"
import { MoveIcon, Pencil, Trash2 } from "lucide-vue-next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ref } from "vue";
import Label from "@/components/ui/label/Label.vue";
import { Switch } from "@/components/ui/switch";

defineProps<{
    size: ItemSize
}>()

const isEditing = ref(false)

</script>
<template>
    <div class="flex gap-4 items-center p-2 border rounded-md bg-card">
        <MoveIcon class="size-drag-handle w-5 h-5 cursor-move text-muted-foreground" />

        <div class="w-full">
            <div v-if="isEditing"
                 class="space-y-2">
                <div class="flex gap-2 items-center">
                    <Label>Name</Label>
                    <Input placeholder="Size label"
                           v-model="size.label" />
                </div>

                <div class="flex gap-2 items-center">
                    <Label>Price</Label>
                    <Input placeholder="Price"
                           v-model="size.price"
                           type="number"
                           step="0.01" />
                </div>
                <div class="flex gap-2 items-center">
                    <Label>Pre Selected</Label>
                    <Switch :checked="size.preSelected"
                            @update:checked="(checked) => {
                                if (checked) {
                                    $emit('makePreSelected')
                                } else {
                                    size.preSelected = undefined;
                                }
                            }" />
                </div>
            </div>
            <div v-else>
                <div class="flex gap-2 items-center cursor-pointer"
                     @click="isEditing = !isEditing">
                    <span title="name-label"
                          class="border rounded-md p-1 mr-2">{{ size.label }}</span>
                    <span title="price"
                          class="border rounded-md p-1">{{ size.price }}</span>
                </div>
            </div>
        </div>

        <Button variant="destructive"
                size="icon"
                @click="$emit('removeSize')">
            <Trash2 class="w-4 h-4" />
        </Button>


    </div>
</template>