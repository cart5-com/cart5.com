<script setup lang="ts">
import { userDataStore } from "../../stores/UserData.store";
import { removeItemFromCart, openItemInCart, clearCartByStoreId, genCartId } from "../../stores/UserDataCartHelpers";
import { computed, ref } from "vue";
import { Minus, Trash2, MoreVerticalIcon, ListX, Pencil } from "lucide-vue-next";
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
        subTotal.value,
        [
            { ...platformServiceFee, name: "Platform" },
            supportPartnerServiceFee && { ...supportPartnerServiceFee, name: "Support Partner" },
            marketingPartnerServiceFee && { ...marketingPartnerServiceFee, name: "Marketing Partner" }
        ],
        taxSettings.taxRateForServiceFees ?? 0,
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
    if (!currentCart.value || !menuRoot.value) return { totalPrice: 0, tax: 0 };
    return calculateCartTotalPrice(currentCart.value, menuRoot.value, taxSettings, orderType);
});

const getPrice = (item: CartItem) => {
    return calculateCartItemPrice(item, menuRoot.value!, taxSettings, window.orderType)
}

const subTotal = computed(() => {
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
                </div><!-- Spacer to balance the layout -->
            </div>
            <div class="flex-1"
                 v-if="currentCart && currentCart.items">
                <div v-for="(item, index) in currentCart?.items"
                     class="border-b border-muted-foreground pb-2"
                     :key="item.itemId ?? index">
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
                            <div class="font-bold text-right">
                                <pre>{{ getPrice(item) }}</pre>
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
                    <span class="font-bold text-lg">
                        <pre>{{ cartTotals }}</pre>
                    </span>
                </div>

                <!-- <div class="flex justify-between items-center px-1 border-t border-muted-foreground"
                     v-for="customSFee in subTotal.calculatedCustomServiceFees"
                     :key="customSFee.name">
                    <span class="font-bold text-lg">
                        <pre>{{ customSFee }}</pre>
                    </span>
                </div> -->

                <div class="flex justify-between items-center px-1 border-t border-muted-foreground">
                    <pre>{{ subTotal }}</pre>
                </div>
                <div class="flex justify-between items-center px-1 border-t border-muted-foreground">
                    <!-- <span class="font-bold text-lg">
                        Service Fee Breakdown
                    </span> -->
                    <!-- <span class="font-bold text-lg">
                        
                    </span> -->
                    <pre>{{ cartBreakdown }}</pre>
                </div>
            </div>
        </div>
    </div>
</template>