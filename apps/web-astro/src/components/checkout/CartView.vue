<script setup lang="ts">
import { currentOrderType, userDataStore } from "../../stores/UserData.store";
import { removeItemFromCart, openItemInCart, genCartId } from "../../stores/UserDataCartHelpers";
import { computed, ref } from "vue";
import { Minus, Trash2, Pencil, Info, Moon, MapPinOff, OctagonX, ChevronDown, ChevronUp } from "lucide-vue-next";
import { type MenuRoot } from "@lib/zod/menuRootSchema";
import { type CartItem } from "@lib/zod/cartItemState";
import { calculateCartItemPrice, calculateCartTotalPrice } from "@lib/utils/calculateCartItemPrice";
import { generateCartItemTextSummary } from "@lib/utils/generateCartItemTextSummary";
import {
    NumberField,
    NumberFieldContent,
    NumberFieldDecrement,
    NumberFieldIncrement,
    NumberFieldInput,
} from '@/components/ui/number-field'
import { Button } from "@/components/ui/button";
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
import { calculateSubTotal } from "@lib/utils/calculateSubTotal";
import type { ServiceFee, CalculationType } from "@lib/zod/serviceFee";
import { platformServiceFee } from "@lib/platformServiceFee";
import {
    calculateCartBreakdown
} from "@lib/utils/calculateCartBreakdown";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'


import { isStoreOpenNow } from "@lib/utils/isOpenNow";

const props = defineProps<{
    isCollapsed?: boolean;
}>();

const isStoreOpen = computed(() => {
    return isStoreOpenNow(currentOrderType.value, window.storeData?.openHours ?? null);
});




const calculationType: CalculationType = window.storeData?.serviceFees?.calculationType ?? "INCLUDE";
const tolerableServiceFeeRate = window.storeData?.serviceFees?.tolerableServiceFeeRate ?? 0;
const offerDiscountIfPossible = window.storeData?.serviceFees?.offerDiscountIfPossible ?? true;
const customServiceFees = window.storeData?.serviceFees?.customServiceFees ?? [];

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
        taxSettings,
        calculationType,
        tolerableServiceFeeRate,
        offerDiscountIfPossible,
        userDataStore.value.userData?.rememberLastPaymentMethodId === "stripe" && (window.storeData?.stripeSettings?.isStripeEnabled ?? false),
        {
            name: "Stripe Fee",
            ratePerOrder: window.storeData?.stripeSettings?.stripeRatePerOrder ?? 0,
            feePerOrder: window.storeData?.stripeSettings?.stripeFeePerOrder ?? 0,
            whoPaysFee: window.storeData?.stripeSettings?.whoPaysStripeFee ?? "STORE"
        }
    )
})

const currentCart = computed(() => {
    return userDataStore.value.userData?.carts?.[genCartId(window.storeData?.id!)];
});


let menuRoot: MenuRoot | null = (window.storeData?.menu?.menuRoot ?? null);
let taxSettings = window.storeData?.taxSettings as TaxSettings;

const updateCartItemQuantity = (item: CartItem, itemIndex: number) => {
    if (item.quantity! === 0) {
        removeItemFromCart(window.storeData?.id!, itemIndex);
    }
}

const openCartItem = (itemIndex: number) => {
    openItemInCart(window.storeData?.id!, itemIndex);
}

const cartTotals = computed(() => {
    return calculateCartTotalPrice(currentCart.value, menuRoot ?? undefined, taxSettings, currentOrderType.value);
});

const itemPrices = computed(() => {
    if (!currentCart.value?.items || !menuRoot) return [];

    return currentCart.value.items.map(item =>
        calculateCartItemPrice(item, menuRoot, taxSettings, currentOrderType.value)
    );
});

const getPrice = (itemIndex: number) => {
    return itemPrices.value[itemIndex] || { shownFee: 0 };
}

const subTotalWithDeliveryAndServiceFees = computed(() => {
    return calculateSubTotal(
        currentCart.value, menuRoot ?? undefined, taxSettings, currentOrderType.value,
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

const offersDelivery = window.storeData?.offersDelivery ?? false;
const offersPickup = window.storeData?.offersPickup ?? false;

const isCollapsed = ref(props.isCollapsed ?? false);

const totalItem = computed(() => {
    return currentCart.value?.items?.reduce((acc: number, item: CartItem) => acc + (item.quantity ?? 0), 0) ?? 0;
});


</script>

<template>
    <div class="flex flex-col gap-2 h-full w-full"
         v-if="menuRoot">
        <div class="flex flex-col gap-2 w-full mx-auto">
            <div class="flex-1"
                 v-if="currentCart && currentCart.items">

                <div class="w-full flex-col cursor-pointer"
                     @click="isCollapsed = !isCollapsed">
                    <div class="flex justify-between items-center font-bold text-2xl">
                        <div>
                            <div class="max-w-full overflow-x-scroll whitespace-nowrap no-scrollbar text-2xl font-bold">
                                {{ currentCart.storeName }}
                            </div>
                            <span
                                  class="text-sm text-muted-foreground max-w-full overflow-x-scroll whitespace-nowrap no-scrollbar">
                                {{ currentCart.storeAddress1 }}
                            </span>
                        </div>
                        <div class="flex-shrink-0">
                            <ChevronUp class="inline-block mr-2"
                                       v-if="!isCollapsed" />
                            <ChevronDown class="inline-block mr-2"
                                         v-else />
                        </div>
                    </div>
                    <div class="text-xs text-muted-foreground">
                        {{ totalItem }} items
                    </div>
                </div>

                <div v-if="!isCollapsed"
                     v-for="(item, index) in currentCart?.items"
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
                                class="w-full my-4">
                            <Pencil />
                            <div
                                 class="max-w-full overflow-x-scroll whitespace-nowrap no-scrollbar text-xl justify-start">
                                {{ currentCart?.orderNote || "Add a note" }}
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
                                    <Button variant="secondary">
                                        Close
                                    </Button>
                                </DrawerClose>
                            </DrawerFooter>
                        </div>
                    </DrawerContent>
                </Drawer>
                <div
                     v-if="currentOrderType === 'delivery' && cartTotals.shownFee < (subTotalWithDeliveryAndServiceFees.bestDeliveryZone?.minCart || 0)">
                    <div class="p-2 bg-destructive text-destructive-foreground">
                        <span class="">
                            Minimum Subtotal:
                            {{ taxSettings.currencySymbol }}{{ subTotalWithDeliveryAndServiceFees.bestDeliveryZone?.minCart }}
                            Please add more items to your cart.
                        </span>
                    </div>
                </div>
                <div class="flex justify-between items-center">
                    <span class="">
                        Subtotal
                    </span>
                    <span class=" text-right">
                        {{ taxSettings.currencySymbol }}{{ cartTotals.shownFee }}
                    </span>
                </div>
                <div class="flex justify-between items-center"
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
                    <div class="flex justify-between items-center "
                         v-if="customSFee.shownFee > 0">
                        <span class="">
                            {{ customSFee.name }}
                        </span>
                        <span class=" text-right">
                            {{ taxSettings.currencySymbol }}{{ customSFee.shownFee }}
                        </span>
                    </div>
                </div>

                <div class="flex justify-between items-center "
                     v-if="cartBreakdown.buyerPaysTaxAndFeesShownFee > 0">
                    <span class="">
                        {{ cartBreakdown.buyerPaysTaxAndFeesName }}

                        <Popover>
                            <PopoverTrigger as-child>
                                <Info class="inline-block ml-2" />
                            </PopoverTrigger>
                            <PopoverContent align="start">
                                <div class="space-y-2">
                                    <h3 class="font-semibold">What's included?</h3>
                                    <div v-for="(fee, index) in cartBreakdown.buyerPaysTaxAndFees"
                                         :key="index">
                                        <div class="flex justify-between items-center">
                                            <div class="font-medium">{{ fee.name }}</div>
                                            <div>{{ fee.currencyShownFee }}</div>
                                        </div>
                                        <div class="text-sm text-muted-foreground">{{ fee.note }}</div>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>

                    </span>
                    <span class=" text-right">
                        {{ taxSettings.currencySymbol }}{{ cartBreakdown.buyerPaysTaxAndFeesShownFee }}
                    </span>
                </div>

                <div class="flex justify-between items-center p-2 text-xl font-bold text-primary"
                     v-if="cartBreakdown.discount > 0">
                    <span class="">
                        Discount
                    </span>
                    <span class=" text-right">
                        -{{ taxSettings.currencySymbol }}{{ cartBreakdown.discount }}
                    </span>
                </div>

                <div class=" p-2 bg-destructive text-destructive-foreground"
                     v-if="!isStoreOpen">
                    <Moon class="mr-1 inline-block" />
                    Store is closed now
                </div>

                <div class=" p-2 bg-destructive text-destructive-foreground"
                     v-if="!subTotalWithDeliveryAndServiceFees.bestDeliveryZone && currentOrderType === 'delivery'">
                    <MapPinOff class="mr-1 inline-block" />
                    Out of delivery zone
                </div>

                <div class=" p-2 bg-destructive text-destructive-foreground"
                     v-if="!offersDelivery && currentOrderType === 'delivery'">
                    <OctagonX class="mr-1 inline-block" />
                    Delivery disabled by store
                </div>

                <div class=" p-2 bg-destructive text-destructive-foreground"
                     v-if="!offersPickup && currentOrderType === 'pickup'">
                    <OctagonX class="mr-1 inline-block" />
                    Pickup disabled by store
                </div>



                <div class="flex justify-between items-center font-bold text-2xl py-4">
                    <span>
                        Total
                        <Popover>
                            <PopoverTrigger as-child>
                                <Info class="inline-block mr-2" />
                            </PopoverTrigger>
                            <PopoverContent align="start">
                                <div class="space-y-2">
                                    <h3 class="font-semibold">Transparency breakdown</h3>
                                    <div v-if="cartBreakdown.allTransparencyBreakdown">
                                        <div v-for="(fee, index) in cartBreakdown.allTransparencyBreakdown"
                                             :key="index"
                                             class="my-4">
                                            <div class="flex justify-between items-center">
                                                <div class="font-medium">
                                                    {{ fee.name }}
                                                </div>
                                                <div>
                                                    {{ fee.currencyShownFee }}
                                                </div>
                                            </div>
                                            <div class="text-sm text-muted-foreground">
                                                {{ fee.note }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>

                    </span>
                    <span class="text-right">
                        {{ taxSettings.currencySymbol }}{{ cartBreakdown.buyerPays }}
                    </span>
                </div>

            </div>
        </div>
    </div>
</template>