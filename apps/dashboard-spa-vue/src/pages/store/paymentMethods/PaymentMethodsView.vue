<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Banknote, CreditCard, Phone, Landmark, Calculator } from 'lucide-vue-next';
import { dashboardApiClient } from '@api-client/dashboard';
import { currentStoreId } from '@dashboard-spa-vue/stores/MyStoresStore';
import { toast } from '@/ui-plus/sonner';
import type { PhysicalPaymentMethods } from '@lib/zod/paymentMethodsSchema';
import { pageTitle } from '@dashboard-spa-vue/stores/LayoutStore';
import PaymentMethodsEditor from './PaymentMethodsEditor.vue';
import { Switch } from '@/components/ui/switch';
import { cleanEmptyProps } from '@lib/utils/cleanEmptyProps';
import { ResType } from '@api-client/typeUtils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-vue-next'

pageTitle.value = 'Payment Methods';

const defaultPaymentMethods = {
    isActive: false,
    cash: false,
    cardTerminal: false,
    customMethods: [],
};

const isLoading = ref(false);
const defaultMethods = ref<PhysicalPaymentMethods>(JSON.parse(JSON.stringify({ ...defaultPaymentMethods, isActive: true })));
const deliveryMethods = ref<PhysicalPaymentMethods>(JSON.parse(JSON.stringify({ ...defaultPaymentMethods, isActive: false })));
const pickupMethods = ref<PhysicalPaymentMethods>(JSON.parse(JSON.stringify({ ...defaultPaymentMethods, isActive: false })));

const loadData = async () => {
    isLoading.value = true;
    try {
        const { data, error } = await (await dashboardApiClient.store[':storeId'].payment_methods.get.$post({
            param: {
                storeId: currentStoreId.value ?? '',
            },
            json: {
                columns: {
                    defaultPaymentMethods: true,
                    deliveryPaymentMethods: true,
                    pickupPaymentMethods: true,
                }
            }
        })).json();

        if (error) {
            toast.error('Failed to load payment methods');
            return;
        }

        if (data) {
            if (data.defaultPaymentMethods) {
                defaultMethods.value = data.defaultPaymentMethods
            }
            if (data.deliveryPaymentMethods) {
                deliveryMethods.value = data.deliveryPaymentMethods
            }
            if (data.pickupPaymentMethods) {
                pickupMethods.value = data.pickupPaymentMethods
            }
        }
    } catch (err) {
        console.error('Error loading payment methods:', err);
        toast.error('Failed to load payment methods');
    } finally {
        isLoading.value = false;
    }
};

const savePaymentMethods = async () => {
    isLoading.value = true;
    try {
        const { error } = await (await dashboardApiClient.store[':storeId'].payment_methods.update.$patch({
            param: {
                storeId: currentStoreId.value ?? '',
            },
            json: cleanEmptyProps({
                defaultPaymentMethods: defaultMethods.value,
                deliveryPaymentMethods: deliveryMethods.value,
                pickupPaymentMethods: pickupMethods.value,
            })
        })).json();

        if (error) {
            toast.error('Failed to save payment methods');
            return;
        }
        toast.success('Payment methods saved successfully');
    } catch (err) {
        console.error('Error saving payment methods:', err);
        toast.error('Failed to save payment methods');
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    loadData();

    // handle #success
    if (window.location.hash === '#success') {
        toast.info('please wait while verifying checkout session');
        handleSuccessUrl();
    } else {
        getStripeCustomerDetails();
    }

});

const path = dashboardApiClient.store[':storeId'].stripe_payment_setup.get_details.$get;
type DetailsType = ResType<typeof path>["data"];

const stripeCustomerDetails = ref<DetailsType | null>(null);
const getStripeCustomerDetails = async () => {
    const { error, data } = await (await dashboardApiClient.store[':storeId'].stripe_payment_setup.get_details.$get({
        param: {
            storeId: currentStoreId.value ?? '',
        }
    })).json();
    if (error) {
        toast.error(error.message ?? 'Failed to get Stripe customer details');
    } else {
        stripeCustomerDetails.value = data;
    }
}

const handleSuccessUrl = async () => {
    const { error, data } = await (await dashboardApiClient.store[':storeId'].stripe_payment_setup.verify_checkout.$get({
        param: {
            storeId: currentStoreId.value ?? '',
        }
    })).json();
    if (error) {
        toast.error(error.message ?? 'Failed to get Stripe Checkout session id');
    } else {
        console.log("checkout_session_id data");
        console.log(data);
        history.replaceState(null, '', window.location.pathname + window.location.search);
        toast.success('Payment method verified and saved successfully');
        getStripeCustomerDetails();
    }
}

const setupStripeCheckout = async () => {
    const { error, data } = await (await dashboardApiClient.store[':storeId'].stripe_payment_setup.start_new_checkout.$get({
        param: {
            storeId: currentStoreId.value ?? '',
        }
    })).json();
    if (error) {
        toast.error(error.message ?? 'Failed to set up Stripe Checkout');
        return;
    } else {
        if (data) {
            window.location.href = data;
        }
    }
}
</script>

<template>
    <div class="space-y-16 max-w-md mx-auto">
        <Alert variant="default"
               class="my-4">
            <AlertCircle class="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
                We charge a small service fee on all orders.
                For in-person payments (cash, card terminal, etc.), you collect these fees directly from customers.
                Please add a payment method so we can collect these fees from you.
                We'll automatically charge your payment method on the 1st of each month based on your balance.
                (We may also process charges earlier if your balance reaches a certain amount)
            </AlertDescription>
        </Alert>

        <Alert v-if="!stripeCustomerDetails?.hasChargablePaymentMethod"
               variant="default"
               class="my-4 bg-destructive text-destructive-foreground">
            <AlertCircle class="h-4 w-4" />
            <AlertTitle>Action Required</AlertTitle>
            <AlertDescription>
                You must add a valid payment method before you can accept orders with physical payment options.
                Your store will not be able to receive orders with physical payment options until this is set up.
            </AlertDescription>
        </Alert>

        <Card>
            <CardHeader>
                <CardTitle>Payment Method Setup</CardTitle>
                <CardDescription>
                    A valid payment method is required to enable in-person payments
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div v-if="stripeCustomerDetails?.hasChargablePaymentMethod"
                     class="mb-4 rounded-md border p-4">
                    <div class="flex items-center gap-2 text-primary">
                        <CreditCard class="h-4 w-4" />
                        <span class="font-medium">Payment Method Active</span>
                    </div>
                    <div v-if="stripeCustomerDetails?.paymentMethodDetails"
                         class="mt-2 text-sm space-y-1 text-muted-foreground">
                        <p><span class="font-medium">Type:</span>
                            {{ stripeCustomerDetails.paymentMethodDetails.brand || stripeCustomerDetails.paymentMethodDetails.type }}
                        </p>
                        <p v-if="stripeCustomerDetails.paymentMethodDetails.last4"><span
                                  class="font-medium">Card:</span> ••••
                            {{ stripeCustomerDetails.paymentMethodDetails.last4 }}
                        </p>
                        <p
                           v-if="stripeCustomerDetails.paymentMethodDetails.exp_month && stripeCustomerDetails.paymentMethodDetails.exp_year">
                            <span class="font-medium">Expires:</span>
                            {{ stripeCustomerDetails.paymentMethodDetails.exp_month }}/{{
                                stripeCustomerDetails.paymentMethodDetails.exp_year }}
                        </p>
                        <details>
                            <summary>
                                <span class="font-medium">more</span>
                            </summary>
                            <pre>{{ stripeCustomerDetails.paymentMethodDetails }}</pre>
                        </details>
                    </div>
                </div>

                <div v-else
                     class="mb-4 rounded-md border p-4">
                    <div class="flex items-center gap-2 text-muted-foreground">
                        <CreditCard class="h-4 w-4" />
                        <span class="font-medium">Payment Method Required</span>
                    </div>
                    <p class="mt-2 text-sm text-muted-foreground">
                        You must add a valid payment method before you can accept orders with physical payment options.
                    </p>
                </div>

                <Button @click="setupStripeCheckout"
                        class="w-full">
                    {{ stripeCustomerDetails?.hasChargablePaymentMethod ? 'Update Payment Method' : 'Add a Payment Method' }}
                </Button>
            </CardContent>
        </Card>

        <Alert v-if="!stripeCustomerDetails?.hasChargablePaymentMethod"
               variant="default"
               class="my-4 bg-destructive text-destructive-foreground">
            <AlertCircle class="h-4 w-4" />
            <AlertDescription>
                Physical payment methods are disabled until you add a valid payment method above
            </AlertDescription>
        </Alert>
        <div :class="{ 'opacity-50 pointer-events-none': !stripeCustomerDetails?.hasChargablePaymentMethod }">

            <Button @click="savePaymentMethods"
                    v-if="stripeCustomerDetails?.hasChargablePaymentMethod"
                    :disabled="isLoading"
                    class="w-full">
                <Loader2 v-if="isLoading"
                         class="mr-2 h-4 w-4 animate-spin" />
                Save Changes
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>Payment methods handled by your staff/your delivery person</CardTitle>
                    <CardDescription>
                        Only in-person/physical payment methods can be configured here.
                        <br>
                        <br>
                        (Online payment methods are configured in the <RouterLink class="underline"
                                    :to="{ name: 'store-stripe' }">Stripe</RouterLink> page
                        )
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p class="text-sm text-muted-foreground">
                        For example:
                    </p>
                    <ul class="text-sm text-muted-foreground list-disc pl-6 mt-2 space-y-4">
                        <li>
                            <Banknote class="inline-block mr-2" /> Cash at pickup counter
                        </li>
                        <li>
                            <Banknote class=" inline-block mr-2" /> Cash at delivery address
                        </li>
                        <li>
                            <Calculator class=" inline-block mr-2" />
                            <CreditCard class=" inline-block mr-2" /> Card at store at counter
                        </li>
                        <li>
                            <Calculator class=" inline-block mr-2" />
                            <CreditCard class=" inline-block mr-2" /> Card at delivery address with delivery
                            person's
                            terminal/device
                        </li>
                        <li>
                            <Phone class=" inline-block mr-2" /> Call me back and I'll give you my card details
                        </li>
                        <li>
                            <Landmark class=" inline-block mr-2" /> Bank transfer (manual validation by store staff)
                        </li>
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Default payment methods</CardTitle>
                    <CardDescription>Set your default payment methods</CardDescription>
                </CardHeader>
                <CardContent>
                    <PaymentMethodsEditor :payment-methods="defaultMethods" />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Delivery payment methods</CardTitle>
                    <CardDescription>
                        {{ deliveryMethods.isActive ? `(Custom delivery payment methods)` : '(Uses same methods as default)' }}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div class="flex items-center space-x-2 mb-6 border-b pb-6">
                        <Switch id="isActive"
                                :checked="deliveryMethods.isActive"
                                @update:checked="(checked) => deliveryMethods.isActive = checked" />
                        <label for="isActive"
                               class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Use Custom Payment Methods
                        </label>
                    </div>
                    <PaymentMethodsEditor :payment-methods="deliveryMethods"
                                          card-details="(delivery person's terminal/device)" />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Pickup payment methods</CardTitle>
                    <CardDescription>
                        {{ pickupMethods.isActive ? `(Custom pickup payment methods)` : '(Uses same methods as default)' }}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div class="flex items-center space-x-2 mb-6 border-b pb-6">
                        <Switch id="isActive"
                                :checked="pickupMethods.isActive"
                                @update:checked="(checked) => pickupMethods.isActive = checked" />
                        <label for="isActive"
                               class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Use Custom Payment Methods
                        </label>
                    </div>
                    <PaymentMethodsEditor :payment-methods="pickupMethods"
                                          card-details="(in store)" />
                </CardContent>
            </Card>

            <Button @click="savePaymentMethods"
                    :disabled="isLoading"
                    class="w-full">
                <Loader2 v-if="isLoading"
                         class="mr-2 h-4 w-4 animate-spin" />
                Save Changes
            </Button>
        </div>
    </div>
</template>