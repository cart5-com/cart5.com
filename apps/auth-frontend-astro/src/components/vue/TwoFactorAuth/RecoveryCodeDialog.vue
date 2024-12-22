<script setup lang="ts">
import { Input } from '@/components/ui/input';
import CopyButton from '@/ui-plus/CopyButton.vue';

const props = defineProps<{
    recoveryCode: string;
}>();

</script>

<template>
    <div>
        <h2 class="text-2xl font-bold">Your account is secured</h2>

        <p class="text-sm">
            Write down this emergency backup code and store it somewhere safe.
            If your device is ever lost or stolen, you can use this code to unlock your account.
        </p>

        <div class="flex items-center space-x-2 my-6">
            <Input type="text"
                   disabled
                   v-model="props.recoveryCode"
                   class="flex-1" />
            <CopyButton :content="props.recoveryCode" />
        </div>
    </div>
</template>
