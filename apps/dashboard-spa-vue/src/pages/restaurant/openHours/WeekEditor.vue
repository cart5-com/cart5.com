<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { XIcon, PlusIcon, MoreVerticalIcon } from 'lucide-vue-next';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { WeeklyHours } from '@lib/types/restaurantTypes';
import { WeeklyScheduleDays } from '@lib/types/dateTimeType';

const DAYS = WeeklyScheduleDays;

const props = defineProps<{
    weekHours: WeeklyHours;
}>();


const applyToOtherDays = (sourceDay: string) => {
    if (!props.weekHours.days) {
        props.weekHours.days = {};
    }
    type DayKey = keyof typeof props.weekHours.days;
    const sourceSettings = props.weekHours.days[sourceDay as DayKey];
    DAYS.forEach(({ key }) => {
        if (key !== sourceDay && props.weekHours.days) {
            props.weekHours.days[key] = {
                isOpen24: sourceSettings?.isOpen24 ?? false,
                hours: JSON.parse(JSON.stringify(sourceSettings?.hours ?? [])),
            };
        }
    });
};
</script>

<template>
    <div class="space-y-4">
        <div v-for="day in DAYS"
             :key="day.key"
             class="border-b pb-4 last:border-b-0">
            <div class="flex items-center justify-between mb-2">
                <div>
                    <h3 class="font-medium">{{ day.label }}</h3>
                    <label :for="`default-hours-${day.key}`"
                           class="cursor-pointer flex flex-row items-center gap-2">
                        <Switch :id="`default-hours-${day.key}`"
                                :checked="weekHours.days?.[day.key]?.isOpen24 ?? false"
                                @update:checked="(val) => {
                                    if (!weekHours.days) weekHours.days = {};
                                    if (!weekHours.days[day.key]) weekHours.days[day.key] = {};
                                    weekHours.days[day.key]!.isOpen24 = val;
                                }" />
                        <span class="text-muted-foreground text-xs">
                            Open 24 hours</span>
                    </label>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                        <Button variant="ghost"
                                size="sm">
                            <MoreVerticalIcon class="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem @click="applyToOtherDays(day.key)">
                            Apply same hours
                            <br>
                            to all other days
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div v-if="!weekHours.days?.[day.key]?.isOpen24"
                 class="space-y-2">
                <div v-if="weekHours.days?.[day.key]"
                     v-for="(timeSlot, index) in weekHours.days[day.key]?.hours ?? []"
                     :key="index"
                     class="flex gap-2 items-center">
                    <Input type="time"
                           v-model="timeSlot.open" />
                    <!-- <span class="text-muted-foreground">to</span> -->
                    <Input type="time"
                           v-model="timeSlot.close" />
                    <Button variant="outline"
                            size="sm"
                            @click="weekHours.days?.[day.key]?.hours?.splice(index, 1)">
                        <XIcon />
                    </Button>
                </div>
                <Button variant="outline"
                        size="sm"
                        @click="() => {
                            if (!weekHours.days) weekHours.days = {};
                            if (!weekHours.days[day.key]) weekHours.days[day.key] = {};
                            if (!weekHours.days[day.key]!.hours) weekHours.days[day.key]!.hours = [];
                            weekHours.days[day.key]!.hours!.push({ open: '09:00', close: '20:00' });
                        }">
                    <PlusIcon class="h-4 w-4 mr-2" />
                    Add Time Slot
                </Button>
            </div>
        </div>
    </div>
</template>