<script setup lang="ts">
import { userDataStore } from "../../stores/UserData.store";
import CartView from "./CartView.vue";
import UserMenu from "../user/UserMenu.vue";
import StorePageAddressWidget from "../store-page/StorePageAddressWidget.vue";
import UserAddressesView from "../user/UserAddressesView.vue";
import { onMounted } from "vue";
import { showPhoneValidationForm } from "@/ui-plus/PhoneNumber/validation/PhoneValidation";
import { getTurnstileUrl } from "@lib/clientUtils/getAuthOrigin";
import OrderTypeWidget from "./OrderTypeWidget.vue";

onMounted(async () => {
    setTimeout(async () => {
        if (userDataStore.value.user?.hasVerifiedPhoneNumber === 0) {
            showPhoneValidationForm(getTurnstileUrl(import.meta.env.PUBLIC_DOMAIN_NAME))
        }
    }, 1000);
})


</script>

<template>
    <div>
        <div class="max-w-md mx-auto"
             v-if="!userDataStore.user">
            Please login or register before checking out
            <UserMenu />
        </div>
        <div v-else>
            <div class="max-w-2xl mx-auto">
                <UserAddressesView />
            </div>

            <StorePageAddressWidget />

            <OrderTypeWidget />
            <CartView />
        </div>
    </div>
</template>