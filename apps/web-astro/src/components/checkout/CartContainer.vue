<script setup lang="ts">
import { currentOrderType, userDataStore, waitUntilUserDataReady } from "../../stores/UserData.store";
import CartView from "./CartView.vue";
import UserMenu from "../user/UserMenu.vue";
import { onMounted } from "vue";
import OrderTypeWidget from "../OrderTypeWidget.vue";
import PaymentMethods from './PaymentMethods.vue';
import { BASE_LINKS } from "@web-astro/utils/links";
import { slugify } from "@lib/utils/slugify";
import SelectedInfo from "./SelectedInfo.vue";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { authGlobalApiClient } from "@api-client/auth_global";
import { showPhoneValidationForm } from "@/ui-plus/PhoneNumber/validation/PhoneValidation";
import { getTurnstileUrl } from "@lib/clientUtils/getAuthOrigin";
import { toast } from "@/ui-plus/sonner";


onMounted(async () => {
    await waitUntilUserDataReady();
    // TODO: do I still need this check?
    // Check if delivery is selected but no address is set
    if (currentOrderType.value === 'delivery' && !userDataStore.value.userData?.rememberLastAddressId) {
        // Redirect to confirm info page
        window.location.href = BASE_LINKS.CONFIRM_INFO(window.storeData?.id!, slugify(window.storeData?.name!));
        return;
    }
})

const placeOrder = async () => {
    if (userDataStore.value.user?.hasVerifiedPhoneNumber === 0) {
        const result = await showPhoneValidationForm(getTurnstileUrl(import.meta.env.PUBLIC_DOMAIN_NAME))
        if (result === 1) {
            userDataStore.value.user.hasVerifiedPhoneNumber = 1;
            toast.success('Phone number verified, now you can place your order');
            return;
        } else {
            toast.error('Phone number verification failed');
            return;
        }
    }
    const { data, error } = await (await authGlobalApiClient[':storeId'].place_order.$post({
        param: {
            storeId: window.storeData?.id ?? '',
        },
    })).json();
    if (error) {
        console.error(error);
    } else {
        console.log(data);
    }
}

const storeId = window.storeData?.id;
const storeName = window.storeData?.name;
</script>

<template>
    <div class="max-w-lg mx-auto">
        <div v-if="!userDataStore.user">
            <Button variant="outline"
                    as="a"
                    :href="BASE_LINKS.STORE(storeId!, slugify(storeName!), currentOrderType)"
                    class="">
                <ChevronLeft class="inline-block mr-2" />
                Back to store
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
                    Back to store
                </Button>
                <OrderTypeWidget />
            </div>


            <!-- Display selected address or pickup name -->
            <SelectedInfo />

            <PaymentMethods />

            <div class="w-full p-4 rounded-lg border bg-card text-card-foreground shadow-sm my-4">
                <CartView :is-collapsed="true" />
            </div>

            <Button size="lg"
                    @click="placeOrder"
                    class="w-full text-lg font-bold">
                Confirm order
                <ChevronRight class="inline-block ml-2" />
            </Button>
            <!-- TODO: remove this -->
            hasVerifiedPhoneNumber:{{ userDataStore.user!.hasVerifiedPhoneNumber }}

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