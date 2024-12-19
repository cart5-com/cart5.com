<script setup lang="ts">
import Separator from '@/components/ui/separator/Separator.vue';
import Setup2FAButton from '@root/components/vue/TwoFactorAuth/Setup2FAButton.vue';
import { useStore } from '@nanostores/vue'
import { $userStore } from '@root/stores/userStore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Lock, LockOpen, ShieldCheck } from 'lucide-vue-next';
const user = useStore($userStore);
</script>

<template>
    <div>
        <details class="mb-4 px-4">
            <summary class="cursor-pointer w-full flex items-center gap-2 bg-secondary p-2 rounded-md">
                <ShieldCheck stroke-width="3" /> Security
            </summary>
            <div class="my-4">
                <Alert v-if="user?.hasNewSession">
                    <LockOpen />
                    <AlertTitle>For your security</AlertTitle>
                    <AlertDescription>
                        You can only change security settings in the first 10 minutes
                    </AlertDescription>
                </Alert>
                <Alert v-if="!user?.hasNewSession"
                       variant="destructive">
                    <Lock />
                    <AlertTitle>A fresh login is required</AlertTitle>
                    <AlertDescription>
                        For your security, you can only make changes within 10 minutes of logging in
                    </AlertDescription>
                </Alert>
                <Setup2FAButton class="my-10"
                                client:only="vue" />
                <Separator class="my-10" />
                <!-- TODO: update password button -->
                <!-- <Separator class="my-10" /> -->
                <!-- TODO: update name button -->
            </div>
        </details>
    </div>
</template>