<script setup lang="ts">
import { authGlobalApiClient } from "@api-client/auth_global";
import type { ResType } from '@api-client/typeUtils';
import { toast } from "@/ui-plus/sonner";
import { onMounted, ref } from "vue";
import { userDataStore, waitUntilUserDataReady } from "@web-astro/stores/UserData.store";
import UserMenu from "@web-astro/components/user/UserMenu.vue";
import { BASE_LINKS } from "@web-astro/utils/links";
import { slugify } from "@lib/utils/slugify";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@lib/utils/formatDate";
import {
    feeBreakdownNameMap
} from "@lib/utils/calculateCartBreakdown";
import {
    Clock, Info, User, CreditCard,
    Banknote, Calculator, WalletCards, ShoppingBag,
    CheckCircle,
    ChevronUp,
    ChevronDown
} from "lucide-vue-next";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { MapPin, House, Building, Hotel, Bed, Factory, BriefcaseBusiness, School, University, Landmark, Store, Castle, Warehouse, Hospital } from 'lucide-vue-next'
import MapEmbed from "@web-astro/components/MapEmbed.vue";

const icons = [
    { name: 'MapPin', component: MapPin },
    { name: 'House', component: House },
    { name: 'Building', component: Building },
    { name: 'Hotel', component: Hotel },
    { name: 'Bed', component: Bed },
    { name: 'Factory', component: Factory },
    { name: 'BriefcaseBusiness', component: BriefcaseBusiness },
    { name: 'School', component: School },
    { name: 'University', component: University },
    { name: 'Landmark', component: Landmark },
    { name: 'Store', component: Store },
    { name: 'Castle', component: Castle },
    { name: 'Warehouse', component: Warehouse },
    { name: 'Hospital', component: Hospital }
];

const paymentIcons = [
    { name: 'CreditCard', component: CreditCard },
    { name: 'Banknote', component: Banknote },
    { name: 'Calculator', component: Calculator },
]

const props = defineProps<{
    orderId?: string;
}>();

const orderDetailsApiPath = authGlobalApiClient[":orderId"].details.$get;
type OrderType = ResType<typeof orderDetailsApiPath>["data"];
const orderDetails = ref<OrderType | null>(null);
const isCollapsed = ref(true);

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

onMounted(async () => {
    await waitUntilUserDataReady();
    if (userDataStore.value.user) {
        loadData();
    }
});


const formatCurrency = (amount: number) => {
    if (!orderDetails.value?.taxSettingsJSON?.currencySymbol) return amount;
    return `${orderDetails.value.taxSettingsJSON.currencySymbol}${amount}`;
};

const orderedQuantity = () => {
    return orderDetails.value?.orderedItemsJSON?.reduce((acc, item) => acc + item.quantity, 0) ?? 0;
};

</script>
<template>
    <div class="max-w-lg mx-auto">
        <div v-if="!userDataStore.user">
            <div class="mt-8">
                Please login to view your order
            </div>
            <UserMenu />
        </div>
        <div v-else-if="isLoading"
             class="my-8 text-center">
            <div class="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4">
            </div>
            Loading order details...
        </div>
        <div v-else-if="orderDetails">
            <Card class="my-4">
                <CardContent class="p-4">
                    <!-- centered big checkmark -->
                    <div class="flex justify-center items-center">
                        <CheckCircle class="text-primary w-20 h-20" />
                    </div>
                    <div class="flex justify-center items-center text-2xl font-bold my-4">
                        Thank you for your order!
                    </div>
                </CardContent>
            </Card>
            <!-- Order ID and Date -->
            <Card class="my-4">
                <CardContent class="p-4">
                    <h2 class="text-xl font-bold mb-2">Order #{{ orderDetails.shortOtp }}</h2>
                    <div class="text-sm text-muted-foreground">
                        <Clock class="inline-block mr-1 h-4 w-4" />
                        Placed on {{ formatDate(orderDetails.created_at_ts) }}
                    </div>
                    <div class="mt-2 text-md font-medium">
                        Status: <span
                              class="capitalize font-bold border border-muted-foreground rounded-md px-2 py-1">{{ orderDetails.orderStatus.toLowerCase() }}</span>
                    </div>
                    <div v-if="orderDetails.estimatedTimeText"
                         class="text-sm text-muted-foreground mt-1">
                        <Clock class="inline-block mr-1 h-4 w-4" />
                        {{ orderDetails.estimatedTimeText }}
                    </div>
                </CardContent>
            </Card>

            <!-- Delivery or Pickup Info -->
            <Card class="my-4"
                  v-if="orderDetails.orderType === 'delivery' && orderDetails.deliveryAddressJSON">
                <CardContent class="p-4">
                    <h3 class="font-bold text-xl mb-2">Delivery Details</h3>
                    <div class="flex items-start gap-2">
                        <component :is="icons.find(icon => icon.name === orderDetails?.deliveryAddressJSON?.icon)?.component || MapPin"
                                   class="mt-1 flex-shrink-0" />
                        <div>
                            <h3 class="font-medium">{{ orderDetails.deliveryAddressJSON.label }}</h3>
                            <p class="text-sm font-bold">{{ orderDetails.deliveryAddressJSON.address1 }}</p>
                            <p v-if="orderDetails.deliveryAddressJSON.address2"
                               class="text-sm font-bold">
                                {{ orderDetails.deliveryAddressJSON.address2 }}
                            </p>
                            <p class="text-sm font-bold">
                                {{ [orderDetails.deliveryAddressJSON.city, orderDetails.deliveryAddressJSON.state].filter(Boolean).join(', ') }}
                                {{ orderDetails.deliveryAddressJSON.postalCode }}
                            </p>
                            <p v-if="orderDetails.deliveryAddressJSON.instructionsForDelivery"
                               class="text-sm italic mt-1">
                                {{ orderDetails.deliveryAddressJSON.instructionsForDelivery }}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card class="my-4"
                  v-else-if="orderDetails.orderType === 'pickup'">
                <CardContent class="p-4">
                    <h3 class="font-bold text-xl mb-2">Pickup Details</h3>
                    <div class="flex items-start gap-2">
                        <User class="mt-1 flex-shrink-0" />
                        <div>
                            <h3 class="font-medium">Pickup Name: {{ orderDetails.pickupNickname }}</h3>
                            <p class="text-sm mt-1">Please provide this name when collecting your order.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <!-- <Card class="my-4">
                <CardContent class="p-4">
                </CardContent>
            </Card> -->
            <div v-if="orderDetails.storeLocationLat && orderDetails.storeLocationLng"
                 class="mt-3 overflow-hidden rounded-lg">
                <MapEmbed :storeLat="orderDetails.storeLocationLat"
                          :storeLng="orderDetails.storeLocationLng"
                          :destinationLat="orderDetails.deliveryAddressJSON?.lat"
                          :destinationLng="orderDetails.deliveryAddressJSON?.lng"
                          :isLink="true" />
            </div>

            <!-- Payment Information -->
            <Card class="my-4">
                <CardContent class="p-4">
                    <h3 class="font-bold text-xl mb-2">Payment</h3>
                    <div class="flex items-center gap-2">
                        <component :is="paymentIcons.find(icon => icon.name === orderDetails?.paymentMethodJSON?.icon)?.component || WalletCards"
                                   class="mr-2 flex-shrink-0" />
                        <div>
                            <p class="font-medium capitalize">{{ orderDetails?.paymentMethodJSON?.name }}</p>
                            <p class="text-sm">{{ orderDetails?.paymentMethodJSON?.description }}</p>
                            <p class="text-sm">
                                {{ orderDetails?.paymentMethodJSON?.isOnline ? 'Online-payment' : 'In-person-payment' }}
                            </p>

                        </div>
                    </div>
                </CardContent>
            </Card>

            <!-- Order Notes -->
            <Card class="my-4"
                  v-if="orderDetails.orderNote">
                <CardContent class="p-4">
                    <h3 class="font-bold text-xl mb-2">Order Notes</h3>
                    <div class="flex items-center gap-2">
                        {{ orderDetails.orderNote }}
                    </div>
                </CardContent>
            </Card>

            <!-- Order Items -->
            <div class="w-full p-4 rounded-lg border bg-card text-card-foreground shadow-sm my-4">
                <div class="flex justify-between items-center cursor-pointer"
                     @click="isCollapsed = !isCollapsed">

                    <h3 class="font-bold text-xl mb-4 flex items-center">
                        <ShoppingBag class="mr-2" />
                        Order Items
                        <span class="text-sm text-muted-foreground ml-2">
                            ({{ orderedQuantity() }} items)
                        </span>
                    </h3>
                    <div class="flex-shrink-0">
                        <ChevronUp class="inline-block mr-2"
                                   v-if="!isCollapsed" />
                        <ChevronDown class="inline-block mr-2"
                                     v-else />
                    </div>
                </div>

                <!-- Order Items List -->
                <div v-for="(item, index) in orderDetails.orderedItemsJSON"
                     :key="index"
                     class="border-t border-muted-foreground pt-3 pb-3"
                     v-if="!isCollapsed">
                    <div class="whitespace-pre-wrap px-2">
                        <div class="font-bold text-xl">
                            {{ item.name }}
                        </div>
                        <div class="text-sm">{{ item.details }}</div>
                    </div>
                    <div class="flex justify-between items-center px-1 mt-2">
                        <div>
                            <span class="font-medium">Quantity: {{ item.quantity }}</span>
                        </div>
                        <div>
                            <div class="font-medium">
                                {{ item.shownFee }}
                            </div>
                        </div>
                    </div>
                </div>



                <!-- Subtotal, Delivery, Fees -->
                <div class="border-t border-muted-foreground pt-3 mt-3">

                    <div class="flex justify-between items-center py-1"
                         v-if="orderDetails.cartTotalsJSON">
                        <span>Subtotal</span>
                        <span>{{ formatCurrency(orderDetails.cartTotalsJSON.shownFee) }}</span>
                    </div>

                    <div class="flex justify-between items-center py-1"
                         v-if="orderDetails.subtotalJSON?.bestDeliveryZone">
                        <span>Delivery Fee</span>
                        <span>{{ formatCurrency(orderDetails.subtotalJSON.bestDeliveryZone.shownFee) }}</span>
                    </div>

                    <!-- Custom Service Fees -->
                    <div v-for="(customFee, index) in orderDetails.subtotalJSON?.calculatedCustomServiceFees"
                         :key="index">
                        <div class="flex justify-between items-center py-1"
                             v-if="customFee.shownFee > 0">
                            <span>{{ customFee.name }}</span>
                            <span>{{ formatCurrency(customFee.shownFee) }}</span>
                        </div>
                    </div>



                    <!-- Tax and Fees -->
                    <div class="flex justify-between items-center py-1"
                         v-if="orderDetails.cartBreakdownJSON && orderDetails.cartBreakdownJSON.buyerPaysTaxAndFeesShownFee > 0">
                        <span class="flex items-center">
                            {{ orderDetails.cartBreakdownJSON.buyerPaysTaxAndFeesName }}
                            <Popover>
                                <PopoverTrigger as-child>
                                    <Info class="inline-block ml-1 h-4 w-4 cursor-pointer" />
                                </PopoverTrigger>
                                <PopoverContent align="start">
                                    <div class="space-y-2">
                                        <h3 class="font-semibold">What's included?</h3>
                                        <div v-for="(fee, index) in orderDetails.cartBreakdownJSON.buyerPaysTaxAndFees"
                                             :key="index">
                                            <div class="flex justify-between items-center">
                                                <div class="font-medium">{{ feeBreakdownNameMap[fee.type].name }}</div>
                                                <div>{{ fee.currencyShownFee }}</div>
                                            </div>
                                            <div class="text-sm text-muted-foreground">
                                                {{ feeBreakdownNameMap[fee.type].note }}
                                            </div>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </span>
                        <span>{{ formatCurrency(orderDetails.cartBreakdownJSON.buyerPaysTaxAndFeesShownFee) }}</span>
                    </div>

                    <!-- Discount -->
                    <div class="flex justify-between items-center py-1 text-xl font-bold text-primary"
                         v-if="orderDetails.cartBreakdownJSON && orderDetails.cartBreakdownJSON.discount > 0">
                        <span>Discount</span>
                        <span>-{{ formatCurrency(orderDetails.cartBreakdownJSON.discount) }}</span>
                    </div>

                    <!-- Total -->
                    <div
                         class="flex justify-between items-center font-bold text-2xl py-2 border-t border-muted-foreground mt-2">
                        <span>
                            Total
                            <Popover>
                                <PopoverTrigger as-child>
                                    <Info class="inline-block" />
                                </PopoverTrigger>
                                <PopoverContent align="start">
                                    <div class="space-y-2">
                                        <h3 class="font-semibold">Transparency breakdown</h3>
                                        <div v-if="orderDetails.cartBreakdownJSON?.allTransparencyBreakdown">
                                            <div v-for="(fee, index) in orderDetails.cartBreakdownJSON.allTransparencyBreakdown"
                                                 :key="index"
                                                 class="my-4">
                                                <div class="flex justify-between items-center">
                                                    <div class="font-medium">
                                                        {{ feeBreakdownNameMap[fee.type].name }}
                                                    </div>
                                                    <div>
                                                        {{ fee.currencyShownFee }}
                                                    </div>
                                                </div>
                                                <div class="text-sm text-muted-foreground">
                                                    {{ feeBreakdownNameMap[fee.type].note }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </span>
                        <span>{{ formatCurrency(orderDetails.finalAmount) }}</span>
                    </div>
                </div>
            </div>
            <!-- Store link -->
            <div class="">
                <span>
                    <Button variant="link"
                            as="a"
                            :href="BASE_LINKS.STORE(orderDetails.storeId, slugify(orderDetails.storeName), orderDetails.orderType!)"
                            class="w-full mr-4">
                        Sold by '{{ orderDetails.storeName }}'
                    </Button>
                </span>
            </div>
            <div class="text-xs text-muted-foreground my-4"
                 v-if="orderDetails?.isOnlinePayment">
                <!-- TODO: show terms and conditions -->
                <CheckCircle class="inline-block mr-2" />
                By placing this order, you agreed to accept full responsibility.
                All orders are final and non-refundable to prevent abuse.
            </div>
        </div>

        <div v-else
             class="my-8 text-center">
            <p>Order not found or you do not have permission to view it.</p>
        </div>
    </div>
</template>
