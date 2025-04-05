<script lang="ts" setup>
import { WeeklyScheduleAsString } from "@lib/utils/weeklyScheduleAsString";
import type { DateTimeProp } from "@lib/zod/weeklyScheduleSchema";
import { Badge } from '@/components/ui/badge'
defineProps<{
    modelValue: DateTimeProp
}>()
</script>
<template>
    <div v-if="modelValue?.type">
        <Badge variant="outline">
            DEBUG:Always
        </Badge>
        <!-- line-clamp-1 -->
        <!-- :style="{ maxWidth: '100ch' }" -->
        <Badge class="max-w-xs line-clamp-1"
               :title="WeeklyScheduleAsString(modelValue?.weeklyScheduleValue)"
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