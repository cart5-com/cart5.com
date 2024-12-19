<script setup lang="ts">
import { Input } from '@/components/ui/input';
import CopyButton from '@/ui-plus/CopyButton.vue';

const props = defineProps<{
    recoveryCode: string;
}>();

</script>

<template>
    <div class="flex items-center space-x-2 my-6">
        <Input type="text"
               disabled
               v-model="props.recoveryCode"
               class="flex-1" />
        <CopyButton :content="props.recoveryCode" />
    </div>
</template>
