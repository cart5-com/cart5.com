<script setup lang="ts">
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { XIcon, MoreVerticalIcon, PlusIcon } from 'lucide-vue-next'
import { Dialog, DialogScrollContent, DialogTrigger } from "@/components/ui/dialog"
import { SettingsIcon } from 'lucide-vue-next';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { useVModel } from '@vueuse/core'
import {
    WeeklyScheduleDays,
    type WeeklySchedule
} from "@lib/types/dateTimeType";
import { Input } from '@/components/ui/input'
import { type Ref } from 'vue'

const props = defineProps<{
    modelValue?: WeeklySchedule
}>()

const emits = defineEmits<{
    (e: 'update:modelValue', payload: WeeklySchedule): void
}>()

const DAYS = WeeklyScheduleDays;

const modelValue = useVModel(props, 'modelValue', emits, {
    passive: true,
    defaultValue: {
        "0": { isOpen24: false, hours: [] },
        "1": { isOpen24: false, hours: [] },
        "2": { isOpen24: false, hours: [] },
        "3": { isOpen24: false, hours: [] },
        "4": { isOpen24: false, hours: [] },
        "5": { isOpen24: false, hours: [] },
        "6": { isOpen24: false, hours: [] }
    },
    deep: props.modelValue ? false : true,
}) as Ref<typeof props.modelValue>;

const applyToOtherDays = (sourceDay: string) => {
    if (!modelValue) return;
    if (!modelValue.value) return;
    const sourceSettings = modelValue.value[sourceDay as keyof typeof modelValue.value];
    if (sourceSettings) {
        DAYS.forEach(({ key }) => {
            if (key !== sourceDay && modelValue.value) {
                modelValue.value[key as keyof typeof modelValue.value] = {
                    isOpen24: sourceSettings?.isOpen24 ?? false,
                    hours: JSON.parse(JSON.stringify(sourceSettings?.hours ?? [])),
                };
            }
        });
    }
}

</script>
<template>
    <Dialog>
        <DialogTrigger>

            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger as-child>
                        <Button variant="outline"
                                size="icon">
                            <SettingsIcon />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Set your days and hours</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>





        </DialogTrigger>
        <DialogScrollContent>
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
                                        :checked="modelValue?.[day.key]?.isOpen24 ?? false"
                                        @update:checked="(val) => {
                                            if (!modelValue) modelValue = {};
                                            if (!modelValue[day.key]) modelValue[day.key] = {};
                                            modelValue[day.key]!.isOpen24 = val;
                                        }" />
                                <span class="text-muted-foreground text-xs">
                                    24 hours</span>
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
                    <div v-if="!modelValue?.[day.key]?.isOpen24"
                         class="space-y-2">
                        <div v-if="modelValue?.[day.key]"
                             v-for="(timeSlot, index) in modelValue?.[day.key]?.hours ?? []"
                             :key="index"
                             class="flex gap-2 items-center">
                            <Input type="time"
                                   v-model="timeSlot.open" />
                            <!-- <span class="text-muted-foreground">to</span> -->
                            <Input type="time"
                                   v-model="timeSlot.close" />
                            <Button variant="outline"
                                    size="sm"
                                    @click="modelValue?.[day.key]?.hours?.splice(index, 1)">
                                <XIcon />
                            </Button>
                        </div>
                        <Button variant="outline"
                                size="sm"
                                @click="() => {
                                    if (!modelValue) modelValue = {};
                                    modelValue[day.key]!.hours!.push({ open: '09:00', close: '20:00' });
                                }">
                            <PlusIcon class="h-4 w-4 mr-2" />
                            Add Time Slot
                        </Button>
                    </div>
                </div>
            </div>
        </DialogScrollContent>
    </Dialog>
</template>