<script setup lang="ts">
import { currentStoreId } from '@dashboard-spa-vue/stores/MyStoresStore';
import { pageTitle } from '@dashboard-spa-vue/stores/LayoutStore';
import { dashboardApiClient } from '@api-client/dashboard';
import { Button } from '@/components/ui/button';
import { onMounted, ref, computed } from 'vue';
import type { ResType } from '@api-client/typeUtils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert, CircleCheck, Loader2 } from 'lucide-vue-next';

onMounted(() => {
    // ?refresh=true
    const refresh = new URLSearchParams(window.location.search).get('refresh');
    if (refresh === 'true') {
        openStripeAccountLink();
    }
    getStripeAccount();
});

pageTitle.value = 'Stripe Settings';
const openStripeAccountLink = async () => {
    isLoading.value = true;
    const { data, error } = await (await dashboardApiClient.store[':storeId'].stripe.account.$post({
        param: {
            storeId: currentStoreId.value || '',
        },
    })).json();
    if (error) {
        isLoading.value = false;
        console.error(error);
    }
    if (data) {
        window.location.href = data;
    }
}
const stripeAccountApiPath = dashboardApiClient.store[':storeId'].stripe.get_account.$get;
type StripeAccount = ResType<typeof stripeAccountApiPath>["data"];
const stripeAccount = ref<StripeAccount | null>(null);
const isLoading = ref(false);

const getStripeAccount = async () => {
    isLoading.value = true;
    try {
        const { data, error } = await (await dashboardApiClient.store[':storeId'].stripe.get_account.$get({
            param: {
                storeId: currentStoreId.value || '',
            },
        })).json();
        if (error) {
            console.error(error);
        }
        if (data) {
            stripeAccount.value = data;
        }
    } finally {
        isLoading.value = false;
    }
}

const isOnboardingComplete = computed(() => {
    if (!stripeAccount.value) return false;
    return stripeAccount.value.account.charges_enabled && stripeAccount.value.account.details_submitted;
});

const isOnboardingStarted = computed(() => {
    return !!stripeAccount.value?.existingStripeSettingsData?.stripeConnectAccountId;
});
</script>

<template>
    <div class="space-y-6">
        <h1 class="text-2xl font-bold">Stripe Settings</h1>

        <div v-if="isLoading"
             class="py-4">
            <Loader2 class="animate-spin" />
        </div>

        <div v-else>
            <!-- Onboarding Status Alert -->
            <Alert v-if="isOnboardingStarted && !isOnboardingComplete"
                   class="mb-4"
                   variant="destructive">
                <TriangleAlert class="h-4 w-4" />
                <AlertTitle>Incomplete Stripe Onboarding</AlertTitle>
                <AlertDescription>
                    Your Stripe account setup is incomplete. Please continue the onboarding process to enable payment
                    processing.
                </AlertDescription>
            </Alert>

            <Alert v-if="isOnboardingComplete"
                   class="mb-4"
                   variant="default">
                <CircleCheck class="h-4 w-4" />
                <AlertTitle>Stripe Account Active</AlertTitle>
                <AlertDescription>
                    Your Stripe account is fully set up and ready to process payments.
                </AlertDescription>
            </Alert>

            <!-- Action Buttons -->
            <div class="flex flex-col gap-3 md:flex-row">
                <Button @click="openStripeAccountLink"
                        class="w-full md:w-auto"
                        variant="default">
                    {{ isOnboardingStarted ? 'Continue Stripe Onboarding' : 'Start Stripe Connect Onboarding' }}
                </Button>

                <Button as="a"
                        v-if="stripeAccount"
                        :href="`https://dashboard.stripe.com/${stripeAccount.existingStripeSettingsData?.stripeConnectAccountId}`"
                        target="_blank"
                        class="w-full md:w-auto"
                        variant="outline">
                    Open Stripe Dashboard
                </Button>
            </div>

            <!-- Stripe Account Details (for debugging) -->
            <div v-if="stripeAccount"
                 class="mt-8">
                <h2 class="text-xl font-semibold mb-2">Stripe Account Details</h2>
                <div class="bg-muted p-4 rounded-md">
                    <div class="mb-2"><strong>Details Submitted:</strong>
                        {{ stripeAccount.account.details_submitted ? 'Yes' : 'No' }}
                    </div>
                    <div class="mb-2"><strong>Charges Enabled:</strong>
                        {{ stripeAccount.account.charges_enabled ? 'Yes' : 'No' }}
                    </div>
                    <div class="mb-2"><strong>stripe account email:</strong>
                        {{ stripeAccount.account.email }}
                    </div>
                    <details class="mt-4">
                        <summary class="cursor-pointer">View Raw Account Data</summary>
                        <pre class="mt-2 text-xs overflow-auto">{{ stripeAccount }}</pre>
                    </details>
                </div>
            </div>


            <!-- https://stripe.com/pricing -->
        </div>
    </div>
</template>