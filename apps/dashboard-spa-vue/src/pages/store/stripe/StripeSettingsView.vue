<script setup lang="ts">
import { currentStoreId } from '@dashboard-spa-vue/stores/MyStoresStore';
import { pageTitle } from '@dashboard-spa-vue/stores/LayoutStore';
import { dashboardApiClient } from '@api-client/dashboard';
import { Button } from '@/components/ui/button';
import { onMounted, ref, computed } from 'vue';
import type { ResType } from '@api-client/typeUtils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert, CircleCheck, Loader2 } from 'lucide-vue-next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/ui-plus/sonner';

const stripeAccountApiPath = dashboardApiClient.store[':storeId'].stripe.get_account.$get;
type StripeAccount = ResType<typeof stripeAccountApiPath>["data"];
const stripeAccount = ref<StripeAccount | null>(null);

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

const isLoading = ref(false);

const saveStripeSettings = async () => {
    isLoading.value = true;
    try {
        const { error } = await (await dashboardApiClient.store[':storeId'].stripe.settings.$patch({
            param: {
                storeId: currentStoreId.value || '',
            },
            json: {
                isStripeEnabled: stripeAccount.value?.existingStripeSettingsData?.isStripeEnabled,
                stripeRatePerOrder: stripeAccount.value?.existingStripeSettingsData?.stripeRatePerOrder,
                stripeFeePerOrder: stripeAccount.value?.existingStripeSettingsData?.stripeFeePerOrder,
                whoPaysStripeFee: stripeAccount.value?.existingStripeSettingsData?.whoPaysStripeFee,
            },
        })).json();
        if (error) {
            toast.error('Failed to save Stripe settings');
        } else {
            toast.success('Stripe settings saved successfully');
        }
    } catch (err) {
        console.error(err);
        toast.error('Failed to save Stripe settings');
    } finally {
        isLoading.value = false;
    }
}

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
    return stripeAccount.value.account?.charges_enabled && stripeAccount.value.account?.details_submitted;
});

const isOnboardingStarted = computed(() => {
    return !!stripeAccount.value?.existingStripeSettingsData?.stripeConnectAccountId;
});
</script>

<template>
    <div class="space-y-6">
        <div v-if="isLoading"
             class="py-4">
            <Loader2 class="animate-spin" />
        </div>

        <div v-else>
            <Card class="mt-8 max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Stripe onboarding</CardTitle>
                    <CardDescription>Register a Stripe account to enable online payments</CardDescription>
                </CardHeader>
                <CardContent class="space-y-6">
                    <!--
                  Onboarding
                  Status
                  Alert
                  -->
                    <Alert v-if="isOnboardingStarted && !isOnboardingComplete"
                           class="mb-4"
                           variant="destructive">
                        <TriangleAlert class="h-4 w-4" />
                        <AlertTitle>Incomplete Stripe Onboarding</AlertTitle>
                        <AlertDescription>
                            Your Stripe account setup is incomplete. Please continue the onboarding process to enable
                            payment
                            processing.
                        </AlertDescription>
                    </Alert>

                    <Alert v-if="isOnboardingComplete"
                           class="mb-4"
                           variant="default">
                        <CircleCheck class="h-4 w-4" />
                        <AlertTitle>Stripe Account Active</AlertTitle>
                        <AlertDescription>
                            Your Stripe account is fully set up and ready to enable.
                        </AlertDescription>
                    </Alert>

                    <!-- Action Buttons -->
                    <div class="flex flex-col gap-3 md:flex-row">
                        <Button @click="openStripeAccountLink"
                                class="w-full md:w-auto"
                                variant="outline">
                            {{ isOnboardingStarted ? (isOnboardingComplete ? '✅ Stripe Account Active' : 'Continue Stripe Onboarding') : 'Start Stripe Connect Onboarding' }}
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
                                {{ stripeAccount.account?.details_submitted ? 'Yes' : 'No' }}
                            </div>
                            <div class="mb-2"><strong>Charges Enabled:</strong>
                                {{ stripeAccount.account?.charges_enabled ? 'Yes' : 'No' }}
                            </div>
                            <div class="mb-2"><strong>stripe account email:</strong>
                                {{ stripeAccount.account?.email }}
                            </div>
                            <details class="mt-4">
                                <summary class="cursor-pointer">View Raw Details</summary>
                                <pre class="mt-2 text-xs overflow-auto">{{ stripeAccount }}</pre>
                            </details>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <!-- Stripe Settings Form -->
            <Card class="mt-8 max-w-2xl mx-auto"
                  v-if="stripeAccount?.existingStripeSettingsData">
                <CardHeader>
                    <CardTitle>Stripe Settings</CardTitle>
                    <CardDescription>Configure your Stripe payment processing settings</CardDescription>
                </CardHeader>
                <CardContent class="space-y-6">
                    <!-- Enable Stripe -->
                    <div class="flex items-center justify-between">
                        <div>
                            <Label>Enable Stripe Payments</Label>
                            <p class="text-xs text-muted-foreground">Allow customers to pay with Stripe</p>
                        </div>
                        <!-- v-model="stripeAccount.existingStripeSettingsData.isStripeEnabled" -->
                        <Switch :checked="stripeAccount.existingStripeSettingsData.isStripeEnabled"
                                @update:checked="(checked) => {
                                    if (stripeAccount && stripeAccount.existingStripeSettingsData) {
                                        stripeAccount.existingStripeSettingsData.isStripeEnabled = checked;
                                    }
                                }"
                                :disabled="!isOnboardingComplete" />
                    </div>

                    <!-- Stripe Fee Settings -->
                    <div class="space-y-4">

                        <div class="space-y-2">
                            <Label>Who Pays Stripe Fee</Label>
                            <Select v-model="stripeAccount.existingStripeSettingsData.whoPaysStripeFee"
                                    :disabled="!isOnboardingComplete">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select who pays the fee" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="STORE">Store</SelectItem>
                                    <SelectItem value="CUSTOMER">Customer</SelectItem>
                                </SelectContent>
                            </Select>
                            <p class="text-xs text-muted-foreground">
                                Choose who will pay the Stripe processing fee
                                <br>
                                <span class="text-xs text-muted-foreground">
                                    If store pays the stripe fee, it will be included in the total price.
                                    <br>
                                    If customer pays the stripe fee, it will be added on top of the order total
                                </span>
                            </p>
                        </div>

                        <div class="flex items-center gap-2 p-3 bg-muted rounded-md text-sm my-4">
                            <TriangleAlert />
                            <span>
                                View and confirm your Stripe pricing details at
                                <a href="https://stripe.com/pricing"
                                   target="_blank"
                                   class="text-primary hover:underline font-medium">
                                    stripe.com/pricing
                                </a>
                                . Make sure to check your country's pricing details.
                            </span>
                        </div>

                        <div class="space-y-2">
                            <Label>Stripe Rate Per Order (%)</Label>
                            <Input v-model="stripeAccount.existingStripeSettingsData.stripeRatePerOrder!"
                                   placeholder="UK: 1.5%, US: 2.9% etc.."
                                   type="number"
                                   step="0.1"
                                   min="0"
                                   :disabled="!isOnboardingComplete" />
                            <p class="text-xs text-muted-foreground">
                                The percentage fee charged by Stripe for each transaction
                            </p>
                        </div>

                        <div class="space-y-2">
                            <Label>Stripe Fixed Fee Per Order</Label>
                            <Input v-model="stripeAccount.existingStripeSettingsData.stripeFeePerOrder!"
                                   placeholder="UK: 0.20, US: 0.30 etc.."
                                   type="number"
                                   step="0.01"
                                   min="0"
                                   :disabled="!isOnboardingComplete" />
                            <p class="text-xs text-muted-foreground">
                                The fixed fee charged by Stripe for each transaction
                            </p>
                        </div>

                        <div class="flex items-center gap-2 p-3 bg-muted rounded-md text-sm my-4">
                            <TriangleAlert class="h-4 min-w-4" />
                            <span>
                                Please assume that this is an estimated calculation and the actual fee may vary
                                according to the your stripe account settings. For example, if you have a high volume of
                                transactions, you may be eligible for a lower fee. or if your buyer use a foreign card,
                                the fee may be higher/updated by stripe.
                            </span>
                        </div>


                    </div>

                    <Button @click="saveStripeSettings"
                            :disabled="isLoading || !isOnboardingComplete"
                            class="w-full mt-4">
                        <Loader2 v-if="isLoading"
                                 class="animate-spin mr-2 h-4 w-4" />
                        Save Stripe Settings
                    </Button>
                </CardContent>
            </Card>

        </div>
    </div>
</template>