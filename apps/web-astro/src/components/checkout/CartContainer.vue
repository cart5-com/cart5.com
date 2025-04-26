<script setup lang="ts">
import { currentOrderType, userDataStore, waitUntilUserDataReady } from "../../stores/UserData.store";
import CartView from "./CartView.vue";
import UserMenu from "../user/UserMenu.vue";
import { onMounted, ref } from "vue";
import { showPhoneValidationForm } from "@/ui-plus/PhoneNumber/validation/PhoneValidation";
import { getTurnstileUrl } from "@lib/clientUtils/getAuthOrigin";
import OrderTypeWidget from "../OrderTypeWidget.vue";
import PaymentMethods from './PaymentMethods.vue';
import { BASE_LINKS } from "@web-astro/utils/links";
import { slugify } from "@lib/utils/slugify";
import SelectedInfo from "./SelectedInfo.vue";
import { ChevronLeft } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

onMounted(async () => {
    await waitUntilUserDataReady();

    // Check if delivery is selected but no address is set
    if (currentOrderType.value === 'delivery' && !userDataStore.value.userData?.rememberLastAddressId) {
        // Redirect to confirm info page
        window.location.href = BASE_LINKS.CONFIRM_INFO(window.storeData?.id!, slugify(window.storeData?.name!));
        return;
    }

    setTimeout(async () => {
        if (userDataStore.value.user?.hasVerifiedPhoneNumber === 0) {
            showPhoneValidationForm(getTurnstileUrl(import.meta.env.PUBLIC_DOMAIN_NAME))
        }
    }, 1000);
})

const storeId = window.storeData?.id;
const storeName = window.storeData?.name;
const currentPaymentMethod = ref('');
</script>

<template>
    <div class="max-w-md mx-auto">
        <div v-if="!userDataStore.user">
            Please login or register before checking out
            <UserMenu />
        </div>
        <div v-else>
            <Button variant="outline"
                    as="a"
                    :href="BASE_LINKS.STORE(storeId!, slugify(storeName!), currentOrderType)"
                    class="w-full">
                <ChevronLeft class="inline-block mr-2" />
                Back to store
            </Button>
            <OrderTypeWidget />

            <!-- Display selected address or pickup name -->
            <SelectedInfo />

            <PaymentMethods v-model="currentPaymentMethod" />

            <Card>
                <CardHeader>
                    <CardTitle></CardTitle>
                </CardHeader>
                <CardContent>
                    <CartView :current-payment-method="currentPaymentMethod"
                              :is-collapsed="true" />
                </CardContent>
            </Card>

        </div>
    </div>
</template>