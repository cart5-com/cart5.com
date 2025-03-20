<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue';
import { useDialog } from '@/ui-plus/dialog/use-dialog';
import Setup2FAForm from './Setup2FAForm.vue';
import { apiClient } from '@api-client/index';
import { toast } from '@/ui-plus/sonner';
import { FileKey, ScanQrCodeIcon } from 'lucide-vue-next';
import RecoveryCodeDialog from '@auth-frontend-vue/components/forms/TwoFactorAuth/RecoveryCodeDialog.vue';
import { userStore, refreshUserData } from '@auth-frontend-vue/stores/userStore';
import { showTurnstile } from '@/ui-plus/dialog/showTurnstile';

const dialog = useDialog();
const setupTwoFactorAuthentication = async () => {
    const loadingDialogId = dialog.showBlockingLoadingModal();
    const { data, error } = await (await apiClient.auth.two_factor_auth.new.$post()).json();
    dialog.cancel(loadingDialogId);
    if (error) {
        console.error(error);
        if (error.code === "FRESH_SESSION_REQUIRED") {
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
                toast.success("Two factor authentication setup successful");
                showRecoveryCodeDialog(values.recoveryCode)
                refreshUserData();
            }
        });
    }
}

const showRecoveryCodeDialog = (recoveryCode: string) => {
    dialog.show<{ recoveryCode: string }>({
        title: "2FA Recovery Code",
        description: "Save this code in a secure location. It can be used to reset your 2FA settings if you lose your device.",
        component: RecoveryCodeDialog,
        props: {
            recoveryCode: recoveryCode
        },
    });
}

const getRecoveryCode = async () => {
    const { data, error } = await (await apiClient.auth.two_factor_auth["get-recovery-code"].$post({
        form: {
            turnstile: await showTurnstile(import.meta.env.VITE_PUBLIC_TURNSTILE_SITE_KEY)
        }
    })).json();
    if (error) {
        console.error(error);
        toast.error(error.message ?? "Something went wrong");
    } else {
        showRecoveryCodeDialog(data);
    }
}

const generateNewRecoveryCode = async () => {
    const { data, error } = await (await apiClient.auth.two_factor_auth["generate-new-recovery-code"].$post({
        form: {
            turnstile: await showTurnstile(import.meta.env.VITE_PUBLIC_TURNSTILE_SITE_KEY)
        }
    })).json();
    if (error) {
        console.error(error);
        toast.error(error.message ?? "Something went wrong");
    } else {
        showRecoveryCodeDialog(data);
    }
}

const removeTwoFactorAuthentication = async () => {
    if (confirm("Are you sure you want to remove two factor authentication?")) {
        const { data, error } = await (await apiClient.auth.two_factor_auth["remove-2fa"].$post({
            form: {
                turnstile: await showTurnstile(import.meta.env.VITE_PUBLIC_TURNSTILE_SITE_KEY)
            }
        })).json();
        if (error) {
            console.error(error);
            toast.error(error.message ?? "Something went wrong");
        } else {
            console.log(data);
            toast.success("Two factor authentication removed");
            refreshUserData();
        }
    }
}
</script>

<template>
    <div>
        <Button v-if="!userStore?.has2FA"
                variant="outline"
                :disabled="!userStore?.hasNewSession"
                class="text-xs sm:text-sm whitespace-normal"
                @click="setupTwoFactorAuthentication">
            <ScanQrCodeIcon class="w-4 h-4" />
            Setup Two Factor Authentication (2FA)
        </Button>
        <div v-if="userStore?.has2FA"
             class="border border-muted-foreground border-dashed rounded-md p-2">
            <div class="flex items-center gap-2">
                <FileKey />
                Two factor authentication (2FA) is enabled
            </div>
            <Button variant="outline"
                    class="my-2"
                    :disabled="!userStore?.hasNewSession"
                    @click="getRecoveryCode()">
                Show Recovery Code
            </Button>
            <Button variant="outline"
                    class="my-2"
                    :disabled="!userStore?.hasNewSession"
                    @click="generateNewRecoveryCode()">
                Generate New Recovery Code
            </Button>
            <Button class="my-2"
                    variant="destructive"
                    :disabled="!userStore?.hasNewSession"
                    @click="removeTwoFactorAuthentication()">
                Remove 2FA
            </Button>
        </div>
    </div>
</template>
