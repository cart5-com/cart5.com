<script lang="ts" setup>
import { type ItemSize } from "lib/types/menuTypes"
import { MoveIcon, Trash2 } from "lucide-vue-next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Label from "@/components/ui/label/Label.vue";
import { Switch } from "@/components/ui/switch";
import OptionGroupIdsList from "./OptionGroupIdsList.vue";

defineProps<{
    size: ItemSize
}>()


</script>
<template>
    <div class="p-2 border rounded-md bg-card">
        <MoveIcon class="size-drag-handle w-5 h-5 cursor-move text-muted-foreground" />

        <div class="w-full my-2">
            <div class="space-y-2">
                <div class="flex gap-2 items-center">
                    <Label>Name</Label>
                    <Input placeholder="Size label"
                           v-model="size.itemSizeLabel" />
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
                <OptionGroupIdsList :item="size" />
            </div>
        </div>

        <Button variant="destructive"
                @click="$emit('removeSize')">
            <Trash2 class="w-4 h-4" /> remove size
        </Button>


    </div>
</template>