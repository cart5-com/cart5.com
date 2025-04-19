<script setup lang="ts">
import { userDataStore } from "../../stores/UserData.store";
import { removeItemFromCart, openItemInCart, clearCartByStoreId, genCartId } from "../../stores/UserDataCartHelpers";
import { computed, ref } from "vue";
import { Minus, Trash2, MoreVerticalIcon, ListX, Pencil, Info } from "lucide-vue-next";
import { type MenuRoot } from "@lib/zod/menuRootSchema";
import { type CartItem } from "@lib/zod/cartItemState";
import { calculateCartItemPrice, calculateCartTotalPrice } from "@lib/utils/calculateCartItemPrice";
import { generateCartItemTextSummary } from "@lib/utils/generateCartItemTextSummary";
import { BASE_LINKS } from "@web-astro/utils/links";
import { slugify } from "@lib/utils/slugify";
import {
    NumberField,
    NumberFieldContent,
    NumberFieldDecrement,
    NumberFieldIncrement,
    NumberFieldInput,
} from '@/components/ui/number-field'
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer'
import { Textarea } from '@/components/ui/textarea'
import type { TaxSettings } from "@lib/zod/taxSchema";
import type { OrderType } from "@lib/types/orderType";
import { calculateSubTotal } from "@lib/utils/calculateSubTotal";
import type { ServiceFee, CalculationType } from "@lib/zod/serviceFee";
import {
    calculateCartBreakdown
} from "@lib/utils/calculateCartBreakdown";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import PaymentMethods from './PaymentMethods.vue';

// TODO: OPEN HOURS VALIDATION HERE
// TODO: SUPPORTED ORDER TYPES VALIDATION HERE (delivery, pickup)

const calculationType: CalculationType = window.storeData?.serviceFees?.calculationType ?? "INCLUDE";
const tolerableServiceFeeRate = window.storeData?.serviceFees?.tolerableServiceFeeRate ?? 0;
const offerDiscountIfPossible = window.storeData?.serviceFees?.offerDiscountIfPossible ?? true;
const customServiceFees = window.storeData?.serviceFees?.customServiceFees ?? [];

const platformServiceFee: ServiceFee | null = {
    ratePerOrder: 1,
    feePerOrder: 0,
};
const supportPartnerServiceFee: ServiceFee | null = window.supportTeamServiceFee;
const marketingPartnerServiceFee: ServiceFee | null = window.websiteTeamServiceFee;

const cartBreakdown = computed(() => {
    return calculateCartBreakdown(
        subTotalWithDeliveryAndServiceFees.value,
        platformServiceFee,
        supportPartnerServiceFee,
        marketingPartnerServiceFee,
        // [
        //     { ...platformServiceFee, name: "Platform" },
        //     supportPartnerServiceFee && { ...supportPartnerServiceFee, name: "Support Partner" },
        //     marketingPartnerServiceFee && { ...marketingPartnerServiceFee, name: "Marketing Partner" }
        // ],
        taxSettings.taxRateForServiceFees ?? 0,
        taxSettings,
        {
            calculationType: calculationType,
            tolerableRate: tolerableServiceFeeRate,
            offerDiscount: offerDiscountIfPossible
        }
    )
})

const currentCart = computed(() => {
    return userDataStore.value.userData?.carts?.[genCartId(window.storeData?.id!)];
});


let menuRoot = ref<MenuRoot | null>(window.storeData?.menu?.menuRoot ?? null);
let taxSettings = window.storeData?.taxSettings as TaxSettings;

const updateCartItemQuantity = (item: CartItem, itemIndex: number) => {
    if (item.quantity! === 0) {
        removeItemFromCart(window.storeData?.id!, itemIndex);
    }
}

const openCartItem = (itemIndex: number) => {
    openItemInCart(window.storeData?.id!, itemIndex);
}

const removeAllItemsFromCart = () => {
    clearCartByStoreId(currentCart.value?.storeId!);
}

const orderType: OrderType = window.orderType

const cartTotals = computed(() => {
    return calculateCartTotalPrice(currentCart.value, menuRoot.value ?? undefined, taxSettings, orderType);
});

const itemPrices = computed(() => {
    if (!currentCart.value?.items || !menuRoot.value) return [];

    return currentCart.value.items.map(item =>
        calculateCartItemPrice(item, menuRoot.value!, taxSettings, window.orderType)
    );
});

const getPrice = (itemIndex: number) => {
    return itemPrices.value[itemIndex] || { shownFee: 0 };
}

const subTotalWithDeliveryAndServiceFees = computed(() => {
    return calculateSubTotal(
        currentCart.value, menuRoot.value ?? undefined, taxSettings, orderType,
        {
            lat: userDataStore.value.userData?.rememberLastLat!,
            lng: userDataStore.value.userData?.rememberLastLng!
        },
        window.storeData?.deliveryZones?.zones ?? [],
        {
            lat: window.storeData?.address?.lat!,
            lng: window.storeData?.address?.lng!
        },
        customServiceFees
    );
})

const currentPaymentMethod = ref('');

</script>

<template>
    <div class="flex flex-col gap-2 h-full"
         v-if="menuRoot">
        <div class="flex flex-col gap-2 max-w-lg w-lg mx-auto">
            <div
                 class="bg-card text-card-foreground relative sticky top-0 z-40 max-w-full flex justify-between items-center">
                <a :href="BASE_LINKS.STORE(currentCart?.storeId!, slugify(currentCart?.storeName!), orderType)"
                   class="max-w-full overflow-x-scroll px-2 whitespace-nowrap no-scrollbar text-2xl font-bold">
                    {{ currentCart?.storeName }}
                </a>
                <div class="flex-shrink-0">
                    <DropdownMenu>
                        <DropdownMenuTrigger as-child>
                            <MoreVerticalIcon class="cursor-pointer" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end"
                                             class="">
                            <DropdownMenuItem @click="removeAllItemsFromCart">
                                <ListX />
                                Clear Cart
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <div class="flex-1"
                 v-if="currentCart && currentCart.items">
                <div v-for="(item, index) in currentCart?.items"
                     class="border-t border-muted-foreground pb-2"
                     :key="index">
                    <div class="whitespace-pre-wrap px-2">
                        <div class="cursor-pointer"
                             @click="openCartItem(index)">
                            <div class="font-bold text-lg">
                                {{ menuRoot.allItems?.[item.itemId!]?.lbl }}
                            </div>
                            {{ generateCartItemTextSummary(item, menuRoot) }}
                        </div>
                    </div>
                    <div class="flex justify-between items-center px-1">
                        <NumberField id="quantity"
                                     class="max-w-40 border border-foreground rounded-md bg-background"
                                     v-model="item.quantity!"
                                     :default-value="1"
                                     @update:model-value="updateCartItemQuantity(item, index)"
                                     :step="1"
                                     :max="100"
                                     :min="0">
                            <NumberFieldContent>
                                <NumberFieldDecrement
                                                      class="bg-secondary rounded-l-md hover:bg-secondary/60 cursor-pointer">
                                    <Trash2 class="h-4 w-4"
                                            v-if="item.quantity! === 1" />
                                    <Minus class="h-4 w-4"
                                           v-else />
                                </NumberFieldDecrement>
                                <NumberFieldInput />
                                <NumberFieldIncrement
                                                      class="bg-secondary rounded-r-md hover:bg-secondary/60 cursor-pointer" />
                            </NumberFieldContent>
                        </NumberField>
                        <div>
                            <div class="font-medium">
                                {{ taxSettings.currencySymbol }}{{ getPrice(index).shownFee }}
                            </div>
                        </div>
                    </div>
                </div>

                <Drawer>
                    <DrawerTrigger as-child>
                        <Button variant="outline"
                                class="w-full">
                            <Pencil />
                            <div
                                 class="max-w-full overflow-x-scroll px-2 whitespace-nowrap no-scrollbar text-xl justify-start">
                                {{ currentCart?.orderNote || "Add an order note" }}
                            </div>
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <div class="mx-auto w-full max-w-sm">
                            <DrawerHeader>
                                <DrawerTitle>Order Notes</DrawerTitle>
                                <DrawerDescription>Set your order notes.</DrawerDescription>
                            </DrawerHeader>
                            <div class="p-4 pb-0">
                                <Textarea v-model="currentCart!.orderNote!"
                                          rows="7"
                                          maxlength="510"
                                          placeholder="Specify which utensils, napkins, straws, and condiments you want to be included or any special instructions that you want the store to be aware of" />
                            </div>
                            <DrawerFooter>
                                <DrawerClose as-child>
                                    <Button variant="outline">
                                        Close
                                    </Button>
                                </DrawerClose>
                            </DrawerFooter>
                        </div>
                    </DrawerContent>
                </Drawer>

                <div class="flex justify-between items-center px-1">
                    <span class="">
                        Subtotal
                    </span>
                    <span class=" text-right">
                        {{ taxSettings.currencySymbol }}{{ cartTotals.shownFee }}
                    </span>
                </div>

                <div class=" p-2 bg-destructive text-destructive-foreground"
                     v-if="!subTotalWithDeliveryAndServiceFees.bestDeliveryZone && orderType === 'delivery'">
                    Out of delivery zone
                </div>
                <div class="flex justify-between items-center px-1 border-t border-muted-foreground"
                     v-if="subTotalWithDeliveryAndServiceFees.bestDeliveryZone">
                    <span class="">
                        Delivery Fee
                    </span>
                    <span class=" text-right">
                        {{ taxSettings.currencySymbol }}{{ subTotalWithDeliveryAndServiceFees.bestDeliveryZone?.shownFee }}
                    </span>
                </div>

                <div v-for="(customSFee, index) in subTotalWithDeliveryAndServiceFees.calculatedCustomServiceFees"
                     :key="index">
                    <div class="flex justify-between items-center px-1 border-t border-muted-foreground"
                         v-if="customSFee.shownFee > 0">
                        <span class="">
                            {{ customSFee.name }}
                        </span>
                        <span class=" text-right">
                            {{ taxSettings.currencySymbol }}{{ customSFee.shownFee }}
                        </span>
                    </div>
                </div>

                <div class="flex justify-between items-center px-1 border-t border-muted-foreground"
                     v-if="cartBreakdown.taxesAndOtherFees.shownFee > 0">
                    <span class="">
                        {{ cartBreakdown.taxesAndOtherFees.shownFeeName }}

                        <Popover>
                            <PopoverTrigger as-child>
                                <Info class="inline-block ml-2" />
                            </PopoverTrigger>
                            <PopoverContent align="start">
                                <div class="space-y-2">
                                    <h3 class="font-semibold">What's included?</h3>
                                    <div v-if="cartBreakdown.taxesAndOtherFees.otherFees > 0">
                                        <div class="flex justify-between items-center">
                                            <div class="font-medium">Platform Fee</div>
                                            <div>
                                                {{ taxSettings.currencySymbol }}{{ cartBreakdown.taxesAndOtherFees.otherFees }}
                                            </div>
                                        </div>
                                        <div class="text-sm text-muted-foreground">This fee varies based on factors like
                                            basket size and helps cover costs related to your order.</div>
                                    </div>
                                    <div v-if="cartBreakdown.taxesAndOtherFees.tax > 0">
                                        <div class="flex justify-between items-center">
                                            <div class="font-medium">
                                                {{ taxSettings.salesTaxType === 'APPLY_TAX_ON_TOP_OF_PRICES' ? '' : '-' }}
                                                Taxes
                                                ({{ taxSettings.taxName }})
                                            </div>
                                            <div>
                                                {{ taxSettings.currencySymbol }}{{ cartBreakdown.taxesAndOtherFees.tax }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>

                    </span>
                    <span class=" text-right">
                        {{ taxSettings.currencySymbol }}{{ cartBreakdown.taxesAndOtherFees.shownFee }}
                    </span>
                </div>

                <div class="flex justify-between items-center p-2 text-xl font-bold bg-primary text-primary-foreground"
                     v-if="cartBreakdown.discount > 0">
                    <span class="">
                        Discount
                    </span>
                    <span class=" text-right">
                        -{{ taxSettings.currencySymbol }}{{ cartBreakdown.discount }}
                    </span>
                </div>

                currentPaymentMethod:{{ currentPaymentMethod }}
                <PaymentMethods v-model="currentPaymentMethod" />

                <div
                     class="flex justify-between items-center px-1 border-t border-muted-foreground font-bold text-2xl py-4">
                    <span>
                        <Popover>
                            <PopoverTrigger as-child>
                                <Info class="inline-block mr-2" />
                            </PopoverTrigger>
                            <PopoverContent align="start">
                                <div class="space-y-2">
                                    <h3 class="font-semibold">Transparency breakdown</h3>
                                    <div v-if="cartBreakdown.taxesAndOtherFees.tax > 0">
                                        <div class="flex justify-between items-center">
                                            <div class="font-medium">
                                                - Taxes
                                            </div>
                                            <div>
                                                {{ taxSettings.currencySymbol }}{{ cartBreakdown.storeReceives.tax }}
                                            </div>
                                        </div>
                                    </div>
                                    <div v-for="(fee) in cartBreakdown.totalPlatformFee.feeBreakdown">
                                        <div class="flex justify-between items-center">
                                            <div class="font-medium">
                                                - {{ (fee as any).name }}
                                            </div>
                                            <div>
                                                {{ taxSettings.currencySymbol }}{{ (fee as any).itemTotal }}
                                            </div>
                                        </div>
                                        <div class="text-sm text-muted-foreground">
                                            {{ (fee as any).note }}
                                        </div>
                                    </div>
                                    <div v-if="cartBreakdown.taxesAndOtherFees.tax > 0">
                                        <div class="flex justify-between items-center">
                                            <div class="font-medium">
                                                - Store
                                            </div>
                                            <div>
                                                {{ taxSettings.currencySymbol }}{{ cartBreakdown.storeReceives.netRevenue }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                        Total
                    </span>
                    <span class="text-right">
                        {{ taxSettings.currencySymbol }}{{ cartBreakdown.buyerPays }}
                    </span>
                </div>

                <!-- <pre>{{ cartBreakdown }}</pre>
                <pre>{{ subTotalWithDeliveryAndServiceFees }}</pre> -->
            </div>
        </div>
    </div>
</template>