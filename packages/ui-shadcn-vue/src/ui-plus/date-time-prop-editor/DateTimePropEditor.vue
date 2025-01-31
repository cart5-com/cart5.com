<script setup lang="ts">
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { dateTimeProp } from './type'
import { useVModel } from '@vueuse/core'
import { Switch } from '@/components/ui/switch';
import WeeklyEditor from '@/ui-plus/date-time-prop-editor/WeeklyEditor.vue';
import { Dialog, DialogScrollContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const props = defineProps<{
    modelValue?: dateTimeProp
}>()

const emits = defineEmits<{
    (e: 'update:modelValue', payload: dateTimeProp): void
}>()

const defaultValue: dateTimeProp = {
    type: "always",
    alwaysValue: false,
    weeklyScheduleValue: undefined,
    dateRangeValue: undefined,
}

const modelValue = useVModel(props, 'modelValue', emits, {
    passive: true,
    defaultValue,
    deep: props.modelValue ? false : true,
})

</script>

<template>
    <div class="space-y-6"
         v-if="modelValue">
        <RadioGroup v-model="modelValue.type"
                    default-value="always">
            <div class="flex items-center space-x-4">
                <RadioGroupItem value="always"
                                id="always" />
                <Label for="always">Always</Label>

                <Dialog>
                    <DialogTrigger>
                        <RadioGroupItem value="weeklySchedule"
                                        id="weeklySchedule" />
                        <Label for="weeklySchedule">Weekly Schedule</Label>
                    </DialogTrigger>
                    <DialogScrollContent>
                        <WeeklyEditor v-model="modelValue.weeklyScheduleValue" />
                    </DialogScrollContent>
                </Dialog>

                <RadioGroupItem value="dateRange"
                                id="dateRange" />
                <Label for="dateRange">Date Range</Label>
            </div>
        </RadioGroup>

        <!-- Always section -->
        <div v-if="modelValue.type === 'always'"
             class="space-y-4">
            <div class="flex items-center space-x-2">
                <Switch :checked="modelValue.alwaysValue"
                        @update:checked="(checked: boolean) => {
                            if (!modelValue) modelValue = {};
                            modelValue.alwaysValue = checked
                        }"
                        :default-checked="modelValue.alwaysValue" />
                <Label>Enable</Label>
            </div>
        </div>
        <!--

        <div v-if="localValue.type === 'dateRange'"
             class="space-y-4">
            <div class="flex items-center space-x-4">
                <div class="space-y-2">
                    <Label>Start Date</Label>
                    <Input v-model="localValue.dateRangeValue?.start"
                           type="datetime-local" />
                </div>
                <div class="space-y-2">
                    <Label>End Date</Label>
                    <Input v-model="localValue.dateRangeValue?.end"
                           type="datetime-local" />
                </div>
            </div>
        </div> -->
    </div>
</template>