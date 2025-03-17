<script setup lang="ts">
import { ref, onMounted } from 'vue';
import HeaderOnly from '@src/layouts/HeaderOnly.vue';
import { toast } from '@/ui-plus/sonner';
import { dashboardApiClient } from '@src/lib/dashboardApiClient';
import { showTurnstilePopup } from '@lib/clientUtils/showTurnstilePopup';
import { getTurnstileUrl } from '@lib/clientUtils/getAuthOrigin';

const isLoading = ref(true);
const errorLabel = ref<string | null>(null);
const invitationInfo = ref<{ teamName: string; email: string } | null>(null);

const token = window.location.search.split('token=')[1];

// Fetch invitation information
const loadData = async () => {
    if (!token) {
        errorLabel.value = 'Invalid invitation link. No token provided.';
        isLoading.value = false;
        return;
    }
    isLoading.value = true;
    const { data, error } = await (await dashboardApiClient.api_dashboard.team.team_invite_info.$post({
        json: { token: token }
    })).json();
    if (error) {
        errorLabel.value = error.message || 'Failed to load invitation details.';
    } else {
        invitationInfo.value = data;
    }
    isLoading.value = false;
};

// Accept invitation
const acceptInvitation = async () => {
    if (!token) {
        errorLabel.value = 'Invalid invitation link. No token provided.';
        isLoading.value = false;
        return;
    }
    let turnstile;
    try {
        turnstile = await showTurnstilePopup(
            getTurnstileUrl(import.meta.env.VITE_PUBLIC_DOMAIN_NAME)
        );
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error(errorMessage);
        return;
    }
    isLoading.value = true;
    const { error } = await (await dashboardApiClient.api_dashboard.team.team_invite_accept.$post({
        json: {
            token: token,
            turnstile
        }
    })).json();
    if (error) {
        toast.error(error.message || 'Failed to accept invitation.');
    } else {
        toast.success('You have successfully joined the team!, will reload in 1 second');
        setTimeout(() => {
            window.location.href = '/dash/';
        }, 1000);
    }
    isLoading.value = false;
};

// Fetch invitation info on component mount
onMounted(loadData);
</script>

<template>
    <HeaderOnly>
        <main class="flex flex-1 flex-col items-center justify-center p-6">
            <div class="w-full max-w-md rounded-lg border border-border p-6 shadow-sm">
                <h1 class="mb-6 text-2xl font-bold">Team Invitation</h1>

                <!-- Loading state -->
                <div v-if="isLoading"
                     class="flex flex-col items-center py-4">
                    <div class="mb-4 h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent">
                    </div>
                    <p>Loading...</p>
                </div>

                <!-- Error state -->
                <div v-else-if="errorLabel"
                     class="rounded-md bg-destructive/15 p-4 text-destructive">
                    <p class="font-semibold">Error</p>
                    <p>{{ errorLabel }}</p>
                </div>

                <!-- Success state -->
                <div v-else-if="invitationInfo"
                     class="flex flex-col gap-4">
                    <div class="rounded-md bg-muted p-4">
                        <p class="text-sm text-muted-foreground">You've been invited to join:</p>
                        <p class="text-lg font-bold">{{ invitationInfo.teamName }}</p>
                    </div>

                    <div class="flex flex-col gap-4">
                        <p>
                            You're invited to join the team for <strong>{{ invitationInfo.teamName }}</strong>.
                            Accept to gain access to this website's dashboard.
                        </p>
                        <div class="flex justify-end gap-2">
                            <button @click="acceptInvitation"
                                    class="rounded-md bg-primary px-4 py-2 text-primary-foreground"
                                    :disabled="isLoading"
                                    :class="{ 'opacity-70': isLoading }">
                                <span v-if="isLoading">Processing...</span>
                                <span v-else>Accept Invitation</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </HeaderOnly>
</template>
