<script setup lang="ts">
import { currentOrderType, userDataStore } from "../../stores/UserData.store";
import CartView from "./CartView.vue";
import UserMenu from "../user/UserMenu.vue";
import OrderTypeWidget from "../OrderTypeWidget.vue";
import PaymentMethods from './PaymentMethods.vue';
import { BASE_LINKS } from "@web-astro/utils/links";
import { slugify } from "@lib/utils/slugify";
import SelectedInfo from "./SelectedInfo.vue";
import { ChevronLeft, ChevronRight, CheckCircle, Loader2 } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { authGlobalApiClient } from "@api-client/auth_global";
import { showPhoneValidationForm } from "@/ui-plus/PhoneNumber/validation/PhoneValidation";
import { getTurnstileUrl } from "@lib/clientUtils/getAuthOrigin";
import { toast } from "@/ui-plus/sonner";
import { ref } from "vue";
import { KNOWN_ERROR } from '@lib/types/errors';
import { checkMinimumOrderValueForDelivery, checkStoreDataBeforePlacingOrder, checkUserDataBeforePlacingOrder } from "@lib/utils/checkBeforePlacingOrder";
import { checkGeocodeDistance } from "@lib/utils/checkGeocodeDistance";
import { geocode } from "@/ui-plus/geolocation-selection-map/geocode";
import type { TaxSettings } from "@lib/zod/taxSchema";

const isPlaceOrderLoading = ref(false);

const placeOrder = async () => {
    isPlaceOrderLoading.value = true;
    // console.log(selectedInfo.value?.selectedAddress);
    // console.log(selectedInfo.value?.pickupNickname);
    if (userDataStore.value.user?.hasVerifiedPhoneNumber === 0) {
        const result = await showPhoneValidationForm(getTurnstileUrl(import.meta.env.PUBLIC_DOMAIN_NAME))
        if (result === 1) {
            userDataStore.value.user.hasVerifiedPhoneNumber = 1;
            // toast.success('Phone number verified, now you can place your order');
            // return;
        } else {
            toast.error('Phone number verification failed');
            return;
        }
    }
    try {
        const { deliveryAddress } = checkUserDataBeforePlacingOrder(
            userDataStore.value.userData!,
            window.location.host,
            window.storeData?.id ?? ''
        );
        if (currentOrderType.value === 'delivery') {
            const mapResult = await geocode(deliveryAddress?.address1 ?? '', deliveryAddress?.country ?? '');
            checkGeocodeDistance(mapResult.data as any, {
                lat: deliveryAddress?.lat!,
                lng: deliveryAddress?.lng!
            });
        }
        checkStoreDataBeforePlacingOrder(
            window.storeData,
            currentOrderType.value,
            userDataStore.value.userData!
        );
        if (cartView.value?.orderedItems.length === 0) {
            toast.error('Please add items to your cart');
            return;
        }
        if (cartView.value?.subTotalWithDeliveryAndServiceFees) {
            checkMinimumOrderValueForDelivery(
                cartView.value?.subTotalWithDeliveryAndServiceFees!,
                window.storeData?.taxSettings as TaxSettings,
                currentOrderType.value,
                cartView.value?.cartTotals
            );
        }
        // ALL CHECKS UNTIL HERE ARE ALSO CHECKING IN SERVERSIDE (place_order.controller.ts)
    } catch (error) {
        if (error instanceof KNOWN_ERROR) {
            toast.error(error.message);
        } else {
            console.error(error);
            toast.error('An unknown error occurred');
        }
        isPlaceOrderLoading.value = false;
        return;
    }

    toast.info('Placing order...');
    const { data, error } = await (await authGlobalApiClient[':storeId'].place_order.$post({
        param: {
            storeId: window.storeData?.id ?? '',
        },
    })).json();
    if (error) {
        console.error(error);
        toast.error(error.message ?? 'An unknown error occurred');
    } else {
        console.log(data);
        window.location.href = BASE_LINKS.ORDER_DETAILS(data.newOrderId);
    }
    setTimeout(() => {
        isPlaceOrderLoading.value = false;
    }, 1000);
}

const storeId = window.storeData?.id;
const storeName = window.storeData?.name;
// currentOrderType
const selectedInfo = ref<InstanceType<typeof SelectedInfo> | null>(null);
const paymentMethods = ref<InstanceType<typeof PaymentMethods> | null>(null);
const cartView = ref<InstanceType<typeof CartView> | null>(null);
</script>

<template>
    <div class="max-w-lg mx-auto">
        <div v-if="!userDataStore.user">
            <Button variant="outline"
                    as="a"
                    :href="BASE_LINKS.STORE(storeId!, slugify(storeName!), currentOrderType)"
                    class="">
                <ChevronLeft class="inline-block mr-2" />
                Back to {{ storeName }}
            </Button>
            <div class="mt-8">
                Please login or register before checking out
            </div>
            <UserMenu />
        </div>
        <div v-else>
            <div class="flex justify-between items-center">
                <Button variant="outline"
                        as="a"
                        :href="BASE_LINKS.STORE(storeId!, slugify(storeName!), currentOrderType)"
                        class="w-full mr-4">
                    <ChevronLeft class="inline-block mr-2" />
                    Back to {{ storeName }}
                </Button>
                <OrderTypeWidget />
            </div>


            <!-- Display selected address or pickup name -->
            <SelectedInfo ref="selectedInfo" />

            <PaymentMethods ref="paymentMethods" />

            <div class="w-full p-4 rounded-lg border bg-card text-card-foreground shadow-sm my-4">
                <CartView :is-collapsed="true"
                          ref="cartView" />
            </div>

            <Button size="lg"
                    @click="placeOrder"
                    :disabled="isPlaceOrderLoading"
                    class="w-full text-lg font-bold">
                <Loader2 class="animate-spin inline-block mr-2"
                         v-if="isPlaceOrderLoading" />
                Place order
                <ChevronRight class="inline-block ml-2" />
            </Button>

            <div class="text-xs text-muted-foreground my-4"
                 v-if="userDataStore.userData!.rememberLastPaymentMethodId === 'stripe'">
                <!-- TODO: show terms and conditions -->
                <CheckCircle class="inline-block mr-2" />
                By placing this order, you agree to accept full responsibility.
                All orders are final and non-refundable to prevent abuse.
            </div>

        </div>
    </div>
</template>