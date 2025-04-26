<script setup lang="ts">
import { orderCurrentType, userDataStore } from "../../stores/UserData.store";
import CartView from "./CartView.vue";
import UserMenu from "../user/UserMenu.vue";
import StorePageAddressWidget from "../store-page/StorePageAddressWidget.vue";
import UserAddressesView from "../user/UserAddressesView.vue";
import { computed, onMounted, ref } from "vue";
import { showPhoneValidationForm } from "@/ui-plus/PhoneNumber/validation/PhoneValidation";
import { getTurnstileUrl } from "@lib/clientUtils/getAuthOrigin";
import OrderTypeWidget from "./OrderTypeWidget.vue";
import PaymentMethods from './PaymentMethods.vue';
import { BASE_LINKS } from "@web-astro/utils/links";
import { slugify } from "@lib/utils/slugify";
import { genCartId } from "@web-astro/stores/UserDataCartHelpers";

onMounted(async () => {
    setTimeout(async () => {
        if (userDataStore.value.user?.hasVerifiedPhoneNumber === 0) {
            showPhoneValidationForm(getTurnstileUrl(import.meta.env.PUBLIC_DOMAIN_NAME))
        }
    }, 1000);
})


const currentPaymentMethod = ref('');
const currentCart = computed(() => {
    return userDataStore.value.userData?.carts?.[genCartId(window.storeData?.id!)];
});

</script>

<template>
    <div class="max-w-md mx-auto">
        <div v-if="!userDataStore.user">
            Please login or register before checking out
            <UserMenu />
        </div>
        <div v-else>
            <div class="max-w-2xl mx-auto my-4">
                <UserAddressesView />
            </div>

            <StorePageAddressWidget />

            <OrderTypeWidget />
            <PaymentMethods v-model="currentPaymentMethod" />

            <div class="bg-card text-card-foreground max-w-full flex justify-between items-center">
                <a :href="BASE_LINKS.STORE(currentCart?.storeId!, slugify(currentCart?.storeName!), orderCurrentType)"
                   class="w-full overflow-x-scroll px-2 whitespace-nowrap no-scrollbar text-2xl font-bold">
                    {{ currentCart?.storeName }}
                </a>
            </div>
            <CartView :current-payment-method="currentPaymentMethod" />

        </div>
    </div>
</template>