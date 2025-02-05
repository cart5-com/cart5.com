<script lang="ts" setup>
import { Dialog, DialogScrollContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { type OptionGroup } from "lib/types/menuTypes"
import { ref } from "vue"
import draggable from "vuedraggable"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-vue-next"
import OptionCard from "./OptionCard.vue"

const isDev = import.meta.env.DEV

const props = defineProps<{
    optionGroup?: OptionGroup
}>()

const isOpen = ref(false)

const addNewOption = () => {
    if (props.optionGroup) {
        if (!props.optionGroup.options) {
            props.optionGroup.options = []
        }
        props.optionGroup.options.push({
            optionId: `option-${Date.now()}`,
            label: `New Option ${props.optionGroup.options.length + 1}`,
            price: 0
        })
    }
}

const deleteOption = (index: number) => {
    if (props.optionGroup) {
        props.optionGroup.options?.splice(index, 1)
        if (props.optionGroup.options?.length === 0) {
            props.optionGroup.options = undefined
        }
    }
}

defineExpose({
    isOpen
})
</script>

<template>
    <Dialog v-model:open="isOpen">
        <DialogScrollContent v-if="optionGroup">
            <DialogHeader>
                <DialogTitle>Edit Option Group</DialogTitle>
            </DialogHeader>
            <div class="grid gap-4 py-4">
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label class="text-right">Name</Label>
                    <Input v-model="optionGroup.optionGroupLabel"
                           class="col-span-3" />
                </div>

                <div class="grid grid-cols-4 items-center gap-4">
                    <Label class="text-right">Min Options</Label>
                    <Input v-model="optionGroup.minOptions"
                           @update:modelValue="(value) => {
                            if (optionGroup && value.toString().trim().length === 0) {
                                optionGroup.minOptions = undefined
                            }
                        }"
                           type="number"
                           class="col-span-3" />
                </div>

                <div class="grid grid-cols-4 items-center gap-4">
                    <Label class="text-right">Max Options</Label>
                    <Input v-model="optionGroup.maxOptions"
                           @update:modelValue="(value) => {
                            if (optionGroup && value.toString().trim().length === 0) {
                                optionGroup.maxOptions = undefined
                            }
                        }"
                           type="number"
                           class="col-span-3" />
                </div>

                <div class="border rounded-lg p-4">
                    <div class="flex justify-between items-center mb-4">
                        <Label>Options</Label>
                        <Button variant="outline"
                                size="sm"
                                @click="addNewOption">
                            <Plus class="w-4 h-4 mr-2" /> Add Option
                        </Button>
                    </div>

                    <draggable v-model="optionGroup.options"
                               group="options"
                               handle=".option-drag-handle"
                               item-key="optionId"
                               class="space-y-4">
                        <template #item="{ element: option, index }">
                            <OptionCard :option="option"
                                        @deleteOption="deleteOption(index)" />
                        </template>
                    </draggable>
                </div>
            </div>
            <details class="mt-4"
                     v-if="isDev">
                <summary>Debug: Option Group JSON</summary>
                <pre class="text-xs">{{ optionGroup }}</pre>
            </details>
        </DialogScrollContent>
    </Dialog>
</template>

<style scoped>
.sortable-chosen {
    border: 1px dashed rgba(var(--primary));
}

.sortable-ghost {
    opacity: 0.5;
    border: 1px dashed rgba(var(--secondary));
}
</style>