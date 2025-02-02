<script setup lang="ts">
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useVModel } from '@vueuse/core'
import { Switch } from '@/components/ui/switch';
import WeeklyEditor from '@/ui-plus/date-time-prop-editor/WeeklyEditor.vue';
import { Dialog, DialogScrollContent, DialogTrigger } from "@/components/ui/dialog"
import type { DateTimeProp } from "lib/types/dateTimeType";
import { SettingsIcon } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import DateBadge from '@/ui-plus/date-time-prop-editor/DateBadge.vue';

const props = defineProps<{
    modelValue?: DateTimeProp
}>()

const emits = defineEmits<{
    (e: 'update:modelValue', payload: DateTimeProp): void
}>()

const defaultValue: DateTimeProp = {
    isEnabled: false,
    type: "always"
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
        <Switch :checked="modelValue.isEnabled"
                @update:checked="(checked: boolean) => {
                    if (!modelValue) modelValue = {};
                    modelValue.isEnabled = checked
                }"
                :default-checked="modelValue.isEnabled" />
        <DateBadge v-model="modelValue" />
        <RadioGroup v-model="modelValue.type"
                    default-value="always"
                    v-if="modelValue.isEnabled">
            <div class="flex items-center space-x-2">
                <RadioGroupItem value="always"
                                id="always" />
                <Label for="always">Always</Label>
            </div>

            <div class="flex items-center space-x-2">
                <RadioGroupItem value="weeklySchedule"
                                id="weeklySchedule" />
                <Label for="weeklySchedule">Weekly Schedule</Label>
                <Dialog v-if="modelValue.type === 'weeklySchedule'">
                    <DialogTrigger>
                        <Button variant="outline"
                                size="icon">
                            <SettingsIcon />
                        </Button>
                    </DialogTrigger>
                    <DialogScrollContent>
                        <WeeklyEditor v-model="modelValue.weeklyScheduleValue" />
                    </DialogScrollContent>
                </Dialog>
            </div>

            <div class="flex items-center space-x-2">
                <RadioGroupItem value="dateRange"
                                id="dateRange" />
                <Label for="dateRange">Date Range</Label>
            </div>
        </RadioGroup>
    </div>
</template>