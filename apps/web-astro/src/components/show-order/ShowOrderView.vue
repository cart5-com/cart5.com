<script setup lang="ts">
import { authGlobalApiClient } from "@api-client/auth_global";
import type { ResType } from '@api-client/typeUtils';
import { toast } from "@/ui-plus/sonner";
import { onMounted, ref } from "vue";
import { userDataStore } from "@web-astro/stores/UserData.store";
import UserMenu from "@web-astro/components/user/UserMenu.vue";
import { BASE_LINKS } from "@web-astro/utils/links";
import { slugify } from "@lib/utils/slugify";
import { Button } from "@/components/ui/button";
const props = defineProps<{
    orderId?: string;
}>();

const orderDetailsApiPath = authGlobalApiClient[":orderId"].details.$get;
type OrderType = ResType<typeof orderDetailsApiPath>["data"];
let orderDetails = ref<OrderType | null>(null);

const isLoading = ref(true);
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
        orderDetails.value = data;
    }
    isLoading.value = false;
}

onMounted(() => {
    if (userDataStore.value.user) {
        loadData();
    }
});

</script>
<template>
    <div class="max-w-lg mx-auto">
        <div v-if="!userDataStore.user">
            <div class="mt-8">
                Please login to view your order
            </div>
            <UserMenu />
        </div>
        <div v-else>
            <div v-if="orderDetails">
                <div class="flex justify-between items-center">
                    <Button variant="outline"
                            as="a"
                            :href="BASE_LINKS.STORE(orderDetails.storeId, slugify(orderDetails.storeName), orderDetails.orderType!)"
                            class="w-full mr-4">
                        {{ orderDetails.storeName }}
                    </Button>
                    <div
                         class="bg-muted text-muted-foreground my-4  w-fit flex items-center justify-center rounded-lg p-1">
                        <Button variant="ghost"
                                class="bg-background text-foreground shadow hover:bg-background/80 capitalize">
                            {{ orderDetails.orderType }}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>
