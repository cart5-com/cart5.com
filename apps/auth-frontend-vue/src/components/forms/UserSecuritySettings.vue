<script setup lang="ts">
import Separator from '@/ui-plus/separator/Separator.vue';
import Setup2FAButton from '@src/components/forms/TwoFactorAuth/Setup2FAButton.vue';
import { userStore, refreshUserData } from '@src/stores/userStore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Lock, LockOpen, ShieldCheck } from 'lucide-vue-next';
import Button from '@/components/ui/button/Button.vue';
import { toast } from '@/ui-plus/sonner'
import { getAuthApiClient } from '@src/lib/authApiClient';
import { showTurnstile } from '@/ui-plus/dialog/showTurnstile';
import { useDialog } from '@/ui-plus/dialog/use-dialog';
import UpdatePasswordForm from '@src/components/forms/UpdatePasswordForm.vue';
const dialog = useDialog();

async function updateName() {
    const newName = prompt("Enter new name");
    if (!newName) {
        toast.error('Please enter a name');
        return;
    }
    const { data, error } = await (await getAuthApiClient().api_auth["user"]['update-name'].$post({
        form: {
            newName,
            turnstile: await showTurnstile(import.meta.env.VITE_PUBLIC_TURNSTILE_SITE_KEY)
        },
    })).json()
    if (error) {
        toast.error(error.message ?? 'An error occurred');
        if (error.code === "FRESH_SESSION_REQUIRED") {
            refreshUserData();
            toast.error("Fresh session required", {
                description: "Please logout and login again"
            });
        }
    } else {
        console.log(data);
        toast.success('Name updated');
        refreshUserData();
    }
}

function openUpdatePasswordDialog() {
    dialog.show({
        title: "Update Password",
        closeable: false,
        component: UpdatePasswordForm,
    });
}
</script>

<template>
    <div>
        <details class="mb-4 px-4">
            <summary class="cursor-pointer w-full flex items-center gap-2 bg-secondary p-2 rounded-md">
                <ShieldCheck stroke-width="3" /> {{ $t('security') }}
            </summary>
            <div class="my-4">
                <Alert v-if="userStore?.hasNewSession">
                    <LockOpen />
                    <AlertTitle>Your login is fresh</AlertTitle>
                    <AlertDescription>
                        You can update your security settings for 10 minutes after logging in.
                        After that, you'll need to log out and log back in to make changes in security settings.
                    </AlertDescription>
                </Alert>
                <Alert v-if="!userStore?.hasNewSession"
                       variant="destructive">
                    <Lock />
                    <AlertTitle>A fresh login is required</AlertTitle>
                    <AlertDescription>
                        For your security, log out then log in again to update security settings.
                    </AlertDescription>
                </Alert>
                <Setup2FAButton class="my-10" />
                <Separator class="my-10" />
                <Button @click="openUpdatePasswordDialog"
                        variant="outline"
                        :disabled="!userStore?.hasNewSession">
                    Update Password
                </Button>
                <Button class="ml-3"
                        :disabled="!userStore?.hasNewSession"
                        @click="updateName"
                        variant="outline">
                    Update name
                </Button>
            </div>
        </details>
    </div>
</template>