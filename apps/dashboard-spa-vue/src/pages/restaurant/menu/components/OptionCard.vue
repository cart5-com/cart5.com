<script lang="ts" setup>
import { MoveIcon, Trash2 } from "lucide-vue-next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { type Option } from "lib/types/menuTypes";
import OptionCardLinkedItemsDialog from "./OptionCardLinkedItemsDialog.vue";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";


defineProps<{
    option: Option
}>()



</script>
<template>
    <div class="flex gap-4 items-center p-2 border rounded-md bg-card">
        <MoveIcon class="option-drag-handle w-5 h-5 cursor-move text-muted-foreground" />
        <div class="flex-grow grid gap-2">
            <Input v-model="option.label"
                   placeholder="Option name" />
            <Input v-model="option.price"
                   type="number"
                   placeholder="Price" />
            <div class="flex gap-2 items-center">
                <Label>Pre Selected</Label>
                <Switch :checked="option.preSelected"
                        @update:checked="(checked: boolean) => {
                            if (checked) {
                                option.preSelected = true
                            } else {
                                option.preSelected = undefined
                            }
                        }" />
            </div>
            <OptionCardLinkedItemsDialog :option="option" />

        </div>
        <Button variant="destructive"
                size="icon"
                @click="$emit('deleteOption')">
            <Trash2 class="w-4 h-4" />
        </Button>
    </div>
</template>