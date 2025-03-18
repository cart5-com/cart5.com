<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Check, HandCoins, CreditCard, Phone, Landmark } from 'lucide-vue-next';
import { apiClient } from '@api-client/index';
import { currentRestaurantId } from '@src/stores/RestaurantStore';
import { toast } from '@/ui-plus/sonner';
import type { PhysicalPaymentMethods } from '@lib/types/restaurantTypes';
import { pageTitle } from '@src/stores/layout.store';
import PaymentMethodsEditor from './PaymentMethodsEditor.vue';
import { Switch } from '@/components/ui/switch';


pageTitle.value = 'Payment Methods';

const defaultPaymentMethods = {
    isActive: true,
    cash: true,
    cardTerminal: false,
    customMethods: [],
};

const isLoading = ref(false);
const defaultMethods = ref<PhysicalPaymentMethods>(JSON.parse(JSON.stringify(defaultPaymentMethods)));
const deliveryMethods = ref<PhysicalPaymentMethods>(JSON.parse(JSON.stringify({ ...defaultPaymentMethods, isActive: false })));
const pickupMethods = ref<PhysicalPaymentMethods>(JSON.parse(JSON.stringify({ ...defaultPaymentMethods, isActive: false })));
const onPremiseMethods = ref<PhysicalPaymentMethods>(JSON.parse(JSON.stringify({ ...defaultPaymentMethods, isActive: false })));
const tableReservationMethods = ref<PhysicalPaymentMethods>(JSON.parse(JSON.stringify({ ...defaultPaymentMethods, isActive: false })));

let ignoreAutoSave = true;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

watch([defaultMethods, deliveryMethods, pickupMethods, onPremiseMethods, tableReservationMethods], () => {
    if (ignoreAutoSave) return;
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
        savePaymentMethods();
    }, 3000);
}, { deep: true });

const loadData = async () => {
    isLoading.value = true;
    try {
        const { data, error } = await (await apiClient.dashboard.restaurant[':restaurantId'].payment_methods.get.$post({
            param: {
                restaurantId: currentRestaurantId.value ?? '',
            },
            json: {
                columns: {
                    defaultPaymentMethods: true,
                    deliveryPaymentMethods: true,
                    pickupPaymentMethods: true,
                    onPremisePaymentMethods: true,
                    tableReservationPaymentMethods: true,
                }
            }
        })).json();

        if (error) {
            toast.error('Failed to load payment methods');
            return;
        }

        if (data) {
            defaultMethods.value = data.defaultPaymentMethods || JSON.parse(JSON.stringify(defaultPaymentMethods));
            deliveryMethods.value = data.deliveryPaymentMethods || JSON.parse(JSON.stringify(defaultPaymentMethods));
            pickupMethods.value = data.pickupPaymentMethods || JSON.parse(JSON.stringify(defaultPaymentMethods));
            onPremiseMethods.value = data.onPremisePaymentMethods || JSON.parse(JSON.stringify(defaultPaymentMethods));
            tableReservationMethods.value = data.tableReservationPaymentMethods || JSON.parse(JSON.stringify(defaultPaymentMethods));
        }
    } catch (err) {
        console.error('Error loading payment methods:', err);
        toast.error('Failed to load payment methods');
    } finally {
        isLoading.value = false;
        setTimeout(() => {
            ignoreAutoSave = false;
        }, 1000);
    }
};

const savePaymentMethods = async () => {
    isLoading.value = true;
    try {
        const { error } = await (await apiClient.dashboard.restaurant[':restaurantId'].payment_methods.update.$patch({
            param: {
                restaurantId: currentRestaurantId.value ?? '',
            },
            json: {
                defaultPaymentMethods: defaultMethods.value,
                deliveryPaymentMethods: deliveryMethods.value,
                pickupPaymentMethods: pickupMethods.value,
                onPremisePaymentMethods: onPremiseMethods.value,
                tableReservationPaymentMethods: tableReservationMethods.value,
            }
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
});

</script>

<template>
    <div class="space-y-16 max-w-md mx-auto">
        <Button @click="savePaymentMethods"
                variant="outline"
                :disabled="isLoading">
            <Loader2 class="w-4 h-4 animate-spin"
                     v-if="isLoading" />
            Auto save
            <Check />
        </Button>

        <Card>
            <CardHeader>
                <CardTitle>Payment methods handled by your staff/your delivery person</CardTitle>
                <CardDescription>
                    Only in-person/physical payment methods can be configured here.
                    <br>
                    <br>
                    <!-- All payment methods added here must be handled manually by restaurant staff.
                    Means delivery person will handle the payment at delivery address.
                    or staff will handle the payment at pickup counter.
                    <br>
                    <br> -->
                    (Online payment methods are configured in the <a class="underline"
                       href="#">Payment Gateways</a> page
                    )
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p class="text-sm text-muted-foreground">
                    For example:
                </p>
                <ul class="text-sm text-muted-foreground list-disc pl-6 mt-2 space-y-4">
                    <li>
                        <HandCoins class="inline-block mr-2" /> Cash at pickup counter
                    </li>
                    <li>
                        <HandCoins class=" inline-block mr-2" /> Cash at delivery address
                    </li>
                    <li>
                        <CreditCard class=" inline-block mr-2" /> Card at restaurant
                    </li>
                    <li>
                        <CreditCard class=" inline-block mr-2" /> Card at delivery address with delivery person's
                        terminal/device
                    </li>
                    <li>
                        <Phone class=" inline-block mr-2" /> Call me back and I'll give you my card details
                    </li>
                    <li>
                        <Landmark class=" inline-block mr-2" /> Bank transfer (manual validation by restaurant staff)
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

        <!-- v-for="(methods, key) in {
        delivery: deliveryMethods,
        pickup: pickupMethods,
        onPremise: onPremiseMethods,
        tableReservation: tableReservationMethods
        }" -->
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
                                      card-details="(in restaurant)" />
            </CardContent>
        </Card>

        <!-- ON_PREMISE_DISABLED_FOR_NOW -->
        <!-- <Card>
            <CardHeader>
                <CardTitle>On premise payment methods</CardTitle>
                <CardDescription>
                    {{ onPremiseMethods.isActive ? `(Custom on premise payment methods)` : '(Uses same methods as default)' }}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div class="flex items-center space-x-2 mb-6 border-b pb-6">
                    <Switch id="isActive"
                            :checked="onPremiseMethods.isActive"
                            @update:checked="(checked) => onPremiseMethods.isActive = checked" />
                    <label for="isActive"
                           class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Use Custom Payment Methods
                    </label>
                </div>
                <PaymentMethodsEditor :payment-methods="onPremiseMethods"
                                      card-details="(in restaurant)" />
            </CardContent>
        </Card> -->

        <!-- TABLE_RESERVATION_DISABLED_FOR_NOW -->
        <!-- <Card>
            <CardHeader>
                <CardTitle>Table reservation payment methods</CardTitle>
                <CardDescription>
                    {{ tableReservationMethods.isActive ? `(Custom table reservation payment methods)` : '(Uses same methods as default)' }}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div class="flex items-center space-x-2 mb-6 border-b pb-6">
                    <Switch id="isActive"
                            :checked="tableReservationMethods.isActive"
                            @update:checked="(checked) => tableReservationMethods.isActive = checked" />
                    <label for="isActive"
                           class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Use Custom Payment Methods
                    </label>
                </div>
                <PaymentMethodsEditor :payment-methods="tableReservationMethods"
                                      card-details="(in restaurant)" />
            </CardContent>
        </Card> -->

        <Button @click="savePaymentMethods"
                :disabled="isLoading"
                class="w-full">
            <Loader2 v-if="isLoading"
                     class="mr-2 h-4 w-4 animate-spin" />
            Save Changes
        </Button>
    </div>
</template>