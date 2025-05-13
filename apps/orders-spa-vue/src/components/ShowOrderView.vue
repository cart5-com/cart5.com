<script setup lang="ts">
import { ordersApiClient } from "@api-client/orders";
// import { authGlobalApiClient } from "@api-client/auth_global";
import type { ResType } from '@api-client/typeUtils';
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@lib/utils/formatDate";
import { estimatedTimeText1 } from "@lib/utils/estimatedTimeText";
import MapEmbed from "./MapEmbed.vue";
import {
    feeBreakdownNameMap
} from "@lib/utils/calculateCartBreakdown";
import {
    Clock, Info, User, CreditCard,
    Banknote, Calculator, WalletCards, ShoppingBag,
} from "lucide-vue-next";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { MapPin, House, Building, Hotel, Bed, Factory, BriefcaseBusiness, School, University, Landmark, Store, Castle, Warehouse, Hospital } from 'lucide-vue-next'

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

// const orderDetailsApiPath = authGlobalApiClient[":orderId"].get_order.$post;
// type OrderType = ResType<typeof orderDetailsApiPath>["data"]['order'];
const ApiPath = ordersApiClient[":storeId"].get_by_order_ids.$post;
type OrderType = ResType<typeof ApiPath>["data"];

const props = defineProps<{
    orderDetails: OrderType[number];
}>();


const formatCurrency = (amount: number) => {
    if (!props.orderDetails?.taxSettingsJSON?.currencySymbol) return amount;
    return `${props.orderDetails.taxSettingsJSON.currencySymbol}${amount}`;
};

const orderedQuantity = () => {
    return props.orderDetails?.orderedItemsJSON?.reduce((acc, item) => acc + item.quantity, 0) ?? 0;
};

</script>
<template>
    <div class="max-w-lg mx-auto w-full">
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
                <div v-if="orderDetails.estimatedTimeJSON"
                     class="text-sm text-muted-foreground mt-1">
                    <Clock class="inline-block mr-1 h-4 w-4" />
                    {{ estimatedTimeText1(orderDetails.orderType!, orderDetails.estimatedTimeJSON) }}
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
                        <!-- <h3 class="font-medium">{{ orderDetails.deliveryAddressJSON.label }}</h3> -->
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
            <div class="flex justify-between items-center cursor-pointer">

                <h3 class="font-bold text-xl mb-4 flex items-center">
                    <ShoppingBag class="mr-2" />
                    Order Items
                    <span class="text-sm text-muted-foreground ml-2">
                        ({{ orderedQuantity() }} items)
                    </span>
                </h3>
            </div>

            <!-- Order Items List -->
            <div v-for="(item, index) in orderDetails.orderedItemsJSON"
                 :key="index"
                 class="border-t border-muted-foreground pt-3 pb-3">
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
        <div v-if="orderDetails.storeLocationLat && orderDetails.storeLocationLng"
             class="mt-3 overflow-hidden rounded-lg">
            <MapEmbed :storeLat="orderDetails.storeLocationLat"
                      :storeLng="orderDetails.storeLocationLng"
                      :destinationLat="orderDetails.deliveryAddressJSON?.lat"
                      :destinationLng="orderDetails.deliveryAddressJSON?.lng"
                      :isLink="true" />
        </div>
        <details v-if="orderDetails.statusHistory.length > 0">
            <summary class="font-bold text-xl mb-4">Status changes</summary>
            <div v-for="(status, index) in orderDetails.statusHistory"
                 :key="index"
                 class="text-xs text-muted-foreground py-2">
                {{ status.newStatus }}
                <br>
                {{ formatDate(status.created_at_ts, undefined, true) }}
            </div>
        </details>
    </div>
</template>
