<script lang="ts" setup>
import { WeeklyScheduleAsString } from "lib/types/dateTimeType";
import type { DateTimeProp } from "lib/types/dateTimeType";
import { Badge } from '@/components/ui/badge'
const props = defineProps<{
    modelValue: DateTimeProp
}>()
</script>
<template>
    <div v-if="modelValue?.isEnabled">
        <Badge v-if="modelValue?.type === 'always'"
               variant="outline">
            DEBUG:Always
        </Badge>
        <!-- line-clamp-1 -->
        <Badge class="max-w-xs overflow-auto max-h-4"
               :title="WeeklyScheduleAsString(modelValue?.weeklyScheduleValue)"
               :style="{ maxWidth: '100ch' }"
               v-if="
                modelValue?.type === 'weeklySchedule' &&
                modelValue?.weeklyScheduleValue
            "
               variant="outline">
            DEBUG: {{
                WeeklyScheduleAsString(modelValue?.weeklyScheduleValue)
            }}
        </Badge>
    </div>
</template>