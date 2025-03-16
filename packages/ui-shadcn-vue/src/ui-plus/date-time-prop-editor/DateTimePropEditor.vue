<script setup lang="ts">
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useVModel } from '@vueuse/core'
import { Switch } from '@/components/ui/switch';
import WeeklyEditor from './WeeklyEditor.vue';
import RangeCalendarEditor from './RangeCalendarEditor.vue';
import type { DateTimeProp } from "@lib/types/dateTimeType";

const props = defineProps<{
    modelValue?: DateTimeProp
}>()

const emits = defineEmits<{
    (e: 'update:modelValue', payload: DateTimeProp): void
}>()

// isEnabled: false,
const defaultValue: DateTimeProp = undefined;

const modelValue = useVModel(props, 'modelValue', emits, {
    passive: true,
    defaultValue,
    deep: props.modelValue ? false : true,
})

</script>

<template>
    <div class="space-y-6">
        <Switch :default-checked="modelValue ? true : false"
                @update:checked="(checked: boolean) => {
                    if (!checked) {
                        modelValue = undefined;
                    } else {
                        modelValue = { type: 'always' };
                    }
                }" />
        <!-- <DateBadge v-model="modelValue" /> -->
        <RadioGroup v-model="modelValue.type"
                    default-value="always"
                    @update:modelValue="(newType) => {
                        // Clear out non-active type data
                        // clean if it is not used
                        if (!modelValue) return;
                        if (newType !== 'weeklySchedule') {
                            modelValue.weeklyScheduleValue = undefined;
                        }
                        if (newType !== 'dateRange') {
                            modelValue.dateRangeValue = undefined;
                        }
                    }"
                    v-if="modelValue">
            <div class="flex items-center space-x-2">
                <RadioGroupItem value="always"
                                id="always" />
                <Label for="always">Always</Label>
            </div>

            <div class="flex items-center space-x-2">
                <RadioGroupItem value="weeklySchedule"
                                id="weeklySchedule" />
                <Label for="weeklySchedule">Weekly Schedule</Label>
                <WeeklyEditor v-model="modelValue.weeklyScheduleValue"
                              v-if="modelValue.type === 'weeklySchedule'" />
            </div>

            <div class="flex items-center space-x-2">
                <RadioGroupItem value="dateRange"
                                id="dateRange" />
                <Label for="dateRange">Date Range</Label>
            </div>
            <RangeCalendarEditor v-model="modelValue.dateRangeValue"
                                 v-if="modelValue.type === 'dateRange'" />
        </RadioGroup>
    </div>
</template>