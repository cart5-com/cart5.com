<script setup lang="ts">
import { authGlobalApiClient } from "@api-client/auth_global";
import type { ResType } from '@api-client/typeUtils';
import { toast } from "@/ui-plus/sonner";
import { onMounted, ref } from "vue";
const props = defineProps<{
    orderId?: string;
}>();

const orderDetailsApiPath = authGlobalApiClient[":orderId"].details.$get;
type OrderType = ResType<typeof orderDetailsApiPath>["data"];
let orderDetails: OrderType;
const isLoading = ref(false);

const loadData = async () => {
    isLoading.value = true;
    const { data, error } = await (
        await authGlobalApiClient[":orderId"].details.$get({
            param: {
                orderId: props.orderId ?? ""
            }
        })
    ).json();
    if (error) {
        console.error(error);
        toast.error(error.message ?? "An unknown error occurred");
    } else {
        console.log(data);
        orderDetails = data;
    }
    isLoading.value = false;
}

onMounted(() => {
    loadData();
});
</script>
<template>
    <div>
        <h1>Order {{ orderId }}</h1>
        <pre v-if="!isLoading"
             id="order-details">{{ orderDetails }}</pre>
    </div>
</template>
