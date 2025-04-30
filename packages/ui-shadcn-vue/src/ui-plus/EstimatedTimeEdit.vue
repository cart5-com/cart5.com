<script lang="ts" setup>
import { Input } from '@/components/ui/input';
import { ESTIMATED_TIME_UNITS, type EstimatedTime } from '@lib/zod/deliverySchema';

defineProps<{
    estimatedTime: EstimatedTime
}>();
</script>

<template>
    <div v-if="estimatedTime"
         class="flex items-center gap-4">
        <div class="flex items-center gap-2">
            Min:<Input type="number"
                   v-model="estimatedTime.min"
                   placeholder="min" />
        </div>
        <div class="flex items-center gap-2">
            Max:<Input type="number"
                   v-model="estimatedTime.max"
                   placeholder="max" />
        </div>
        <select class="text-lg font-bold bg-background text-background-foreground p-2 rounded-md"
                v-model="estimatedTime.unit"
                placeholder="unit">
            <option v-for="unit in ESTIMATED_TIME_UNITS"
                    :value="unit">
                {{ unit }}
            </option>
        </select>
    </div>
</template>