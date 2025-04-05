<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import {
    type DateRangeValueType,
} from "@lib/zod/weeklyScheduleSchema";
import { type Ref } from 'vue'
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight
} from 'lucide-vue-next'
import {
    DateRange,
    DateRangePickerArrow,
    DateRangePickerCalendar,
    DateRangePickerCell,
    DateRangePickerCellTrigger,
    DateRangePickerContent,
    DateRangePickerField,
    DateRangePickerGrid,
    DateRangePickerGridBody,
    DateRangePickerGridHead,
    DateRangePickerGridRow,
    DateRangePickerHeadCell,
    DateRangePickerHeader,
    DateRangePickerHeading,
    DateRangePickerInput,
    DateRangePickerNext,
    DateRangePickerPrev,
    DateRangePickerRoot,
    DateRangePickerTrigger,
} from 'radix-vue';
import { fromDate } from '@internationalized/date';


const props = defineProps<{
    modelValue?: DateRangeValueType
}>()

const emits = defineEmits<{
    (e: 'update:modelValue', payload: DateRangeValueType): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
    passive: true,
    defaultValue: {
        start: undefined,
        end: undefined,
    },
    deep: props.modelValue ? false : true,
}) as Ref<typeof props.modelValue>;

const handleModelValueChange = (date: DateRange) => {
    modelValue.value = {
        start: date.start?.toDate(Intl.DateTimeFormat().resolvedOptions().timeZone).getTime(),
        end: date.end?.toDate(Intl.DateTimeFormat().resolvedOptions().timeZone).getTime(),
    }
}
</script>

<template>
    <DateRangePickerRoot v-if="modelValue"
                         :hour-cycle="24"
                         granularity="minute"
                         :hide-time-zone="false"
                         :default-value="{
                            start: modelValue.start ?
                                fromDate(new Date(modelValue.start), Intl.DateTimeFormat().resolvedOptions().timeZone) :
                                undefined,
                            end: modelValue.end ?
                                fromDate(new Date(modelValue.end), Intl.DateTimeFormat().resolvedOptions().timeZone) :
                                undefined,
                        }"
                         @update:model-value="handleModelValueChange">
        <DateRangePickerField v-slot="{ segments }"
                              class="flex items-center justify-between  border rounded-md max-w-fit pl-2">
            <div class="flex items-center">
                <template v-for="item in segments.start"
                          :key="item.part">
                    <DateRangePickerInput v-if="item.part === 'literal'"
                                          :part="item.part"
                                          type="start">
                        {{ item.value }}
                    </DateRangePickerInput>
                    <DateRangePickerInput v-else
                                          :part="item.part"
                                          class="rounded-md text-center focus:outline-none focus:ring-2 focus:ring-ring"
                                          type="start">
                        {{ item.value }}
                    </DateRangePickerInput>
                </template>
                <span class="mx-2 text-muted-foreground"> - </span>
                <template v-for="item in segments.end"
                          :key="item.part">
                    <DateRangePickerInput v-if="item.part === 'literal'"
                                          :part="item.part"
                                          type="end">
                        {{ item.value }}
                    </DateRangePickerInput>
                    <DateRangePickerInput v-else
                                          :part="item.part"
                                          class="rounded-md text-center focus:outline-none focus:ring-2 focus:ring-ring"
                                          type="end">
                        {{ item.value }}
                    </DateRangePickerInput>
                </template>
            </div>

            <DateRangePickerTrigger
                                    class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 p-2">
                <CalendarIcon class="h-5 w-5" />
            </DateRangePickerTrigger>
        </DateRangePickerField>

        <DateRangePickerContent :side-offset="4"
                                class="z-50 w-auto rounded-md border bg-popover  text-popover-foreground shadow-md">
            <DateRangePickerArrow class="fill-popover" />
            <DateRangePickerCalendar v-slot="{ weekDays, grid }"
                                     class="">
                <DateRangePickerHeader class="flex items-center justify-between">
                    <DateRangePickerPrev
                                         class="inline-flex h-7 w-7 items-center justify-center rounded-md bg-transparent opacity-50 hover:opacity-100">
                        <ChevronLeft class="h-4 w-4" />
                    </DateRangePickerPrev>

                    <DateRangePickerHeading class="text-sm font-medium" />

                    <DateRangePickerNext
                                         class="inline-flex h-7 w-7 items-center justify-center rounded-md bg-transparent opacity-50 hover:opacity-100">
                        <ChevronRight class="h-4 w-4" />
                    </DateRangePickerNext>
                </DateRangePickerHeader>

                <div class="mt-4 flex flex-col gap-4 sm:flex-row sm:gap-x-4 sm:gap-y-0">
                    <DateRangePickerGrid v-for="month in grid"
                                         :key="month.value.toString()"
                                         class="w-full border-collapse space-y-1">
                        <DateRangePickerGridHead>
                            <DateRangePickerGridRow class="flex">
                                <DateRangePickerHeadCell v-for="day in weekDays"
                                                         :key="day"
                                                         class="w-9 rounded-md text-[0.8rem] font-normal text-muted-foreground">
                                    {{ day }}
                                </DateRangePickerHeadCell>
                            </DateRangePickerGridRow>
                        </DateRangePickerGridHead>
                        <DateRangePickerGridBody>
                            <DateRangePickerGridRow v-for="(weekDates, index) in month.rows"
                                                    :key="`weekDate-${index}`"
                                                    class="mt-2 flex w-full">
                                <DateRangePickerCell v-for="weekDate in weekDates"
                                                     :key="weekDate.toString()"
                                                     :date="weekDate"
                                                     class="relative h-9 w-9 text-center text-sm focus-within:relative focus-within:z-20">
                                    <DateRangePickerCellTrigger :day="weekDate"
                                                                :month="month.value"
                                                                class="inline-flex h-9 w-9 items-center justify-center rounded-md font-normal hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:outline-none  data-[today]:before:block data-[today]:before:bg-primary data-[today]:before:rounded-full data-[today]:before:w-2 data-[today]:before:top-[5px]  data-[today]:before:absolute data-[today]:before:h-2 data-[today]:before:z-50 data-[today]:before:border data-[today]:before:border-background data-[outside-month]:text-muted-foreground data-[selected]:bg-primary data-[selected]:text-primary-foreground" />
                                </DateRangePickerCell>
                            </DateRangePickerGridRow>
                        </DateRangePickerGridBody>
                    </DateRangePickerGrid>
                </div>
            </DateRangePickerCalendar>
        </DateRangePickerContent>
    </DateRangePickerRoot>
</template>