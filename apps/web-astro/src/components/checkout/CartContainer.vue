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
import { ChevronLeft } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { showPhoneValidationForm } from "@/ui-plus/PhoneNumber/validation/PhoneValidation";
// import { getTurnstileUrl } from "@lib/clientUtils/getAuthOrigin";

onMounted(async () => {
    await waitUntilUserDataReady();
    // Check if delivery is selected but no address is set
    if (currentOrderType.value === 'delivery' && !userDataStore.value.userData?.rememberLastAddressId) {
        // Redirect to confirm info page
        window.location.href = BASE_LINKS.CONFIRM_INFO(window.storeData?.id!, slugify(window.storeData?.name!));
        return;
    }
    // setTimeout(async () => {
    //     if (userDataStore.value.user?.hasVerifiedPhoneNumber === 0) {
    //         showPhoneValidationForm(getTurnstileUrl(import.meta.env.PUBLIC_DOMAIN_NAME))
    //     }
    // }, 1000);
})

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

        </div>
    </div>
</template>