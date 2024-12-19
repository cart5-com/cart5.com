<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue';
import { useDialog } from '@/ui-plus/dialog/use-dialog';
import Setup2FAForm from './Setup2FAForm.vue';
import { authApiClient } from '@root/lib/authApiClient';
import { toast } from '@/components/ui/sonner';
import { FileKey, ScanQrCodeIcon } from 'lucide-vue-next';
import RecoveryCodeDialog from '@root/components/vue/TwoFactorAuth/RecoveryCodeDialog.vue';
import { useStore } from '@nanostores/vue'
import { $userStore, refreshUserData } from '@root/stores/userStore';
const user = useStore($userStore);

const dialog = useDialog();
const setupTwoFactorAuthentication = async () => {
    const loadingDialogId = dialog.showBlockingLoadingModal();
    const { data, error } = await (await authApiClient.api["two-factor-auth"].new.$post()).json();
    dialog.cancel(loadingDialogId);
    if (error) {
        console.error(error);
        if (error.code === "MUST_BE_NEW_SESSION") {
            toast.error("Fresh session required", {
                description: "Please logout and login again"
            });
        } else {
            toast.error(error.message ?? "Something went wrong");
        }
    } else {
        dialog.show<{ recoveryCode: string }>({
            title: "Setup Two Factor Authentication",
            closeable: false,
            component: Setup2FAForm,
            props: data,
            onSuccess: async (values) => {
                showRecoveryCodeDialog(values.recoveryCode)
                refreshUserData();
            }
        });
    }
}

const showRecoveryCodeDialog = (recoveryCode: string) => {
    toast.success("Two factor authentication setup successful", {
        action: {
            label: "Show Code",
            onClick: () => showRecoveryCodeDialog(recoveryCode)
        }
    });
    dialog.show<{ recoveryCode: string }>({
        title: "2FA Recovery Code",
        description: "Save this code in a secure location. It can be used to reset your 2FA settings if you lose your device.",
        component: RecoveryCodeDialog,
        props: {
            recoveryCode: recoveryCode
        },
    });
}
</script>

<template>

    <div>
        <Button v-if="!user?.has2FA"
                variant="outline"
                :disabled="!user?.hasNewSession"
                class="text-xs sm:text-sm whitespace-normal"
                @click="setupTwoFactorAuthentication">
            <ScanQrCodeIcon class="w-4 h-4" />
            Setup Two Factor Authentication (2FA)
        </Button>
        <div v-if="user?.has2FA"
             class="flex items-center gap-2 border border-dashed rounded-md p-2">
            <FileKey />
            Two factor authentication is enabled
        </div>
        <!-- TODO: Add a button to remove 2FA -->
    </div>
</template>
