<script setup lang="ts">
import Separator from '@/components/ui/separator/Separator.vue';
import Setup2FAButton from '@root/components/vue/TwoFactorAuth/Setup2FAButton.vue';
import { useStore } from '@nanostores/vue'
import { $userStore } from '@root/stores/userStore';
import { ShieldCheck } from 'lucide-vue-next';
const user = useStore($userStore);
</script>

<template>
    <div>
        <details class="mb-4 px-4">
            <summary class="cursor-pointer w-full flex items-center gap-2 bg-muted p-2 rounded-md">
                <ShieldCheck stroke-width="3" /> Security
            </summary>
            <div>
                <div v-if="!user?.hasNewSession"
                     class="text-destructive text-sm my-2">
                    Fresh session required.
                    <div>
                        Please log out and log in again to change your security settings
                    </div>
                    <Separator class="my-10" />
                </div>
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