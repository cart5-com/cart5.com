<script setup lang="ts">
import { userDataStore } from "../../stores/UserData.store";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { removeItemFromCart, openItemInCart, clearCartByStoreId, genCartId } from "../../stores/UserDataCartHelpers";
import { computed, onMounted, ref } from "vue";
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
import { getBestDeliveryZone } from "@lib/utils/getBestDeliveryZone";
import { calculateFeeTax } from "@lib/utils/calculateFeeTax";
import { calculateSubTotal } from "@lib/utils/calculateSubTotal";
import type { ServiceFee, CalculationType } from "@lib/zod/serviceFee";
import {
    calculateAllServiceFees,
    tolerableServiceFee,
    serviceFeeAmountNeedToPayByBuyer,
    calculateDiscount,
    buyerPays,
    storeReceives
} from "@lib/utils/calculateServiceFee";
import { calculateStripeFee } from "@lib/utils/rateCalc";
import { roundTo2Decimals } from "@lib/utils/roundTo2Decimals";

const calculationType: CalculationType = window.storeData?.serviceFees?.calculationType ?? "INCLUDE";
const tolerableServiceFeeRate = window.storeData?.serviceFees?.tolerableServiceFeeRate ?? 0;
const offerDiscountIfPossible = window.storeData?.serviceFees?.offerDiscountIfPossible ?? true;
const customServiceFees = window.storeData?.serviceFees?.customServiceFees ?? [];
const isStripe = ref(false);

const platformServiceFee: ServiceFee | null = {
    ratePerOrder: 1,
    feePerOrder: 0,
};
const supportPartnerServiceFee: ServiceFee | null = window.supportTeamServiceFee;
const marketingPartnerServiceFee: ServiceFee | null = window.websiteTeamServiceFee;

const serviceFeeForThisOrder = computed(() => {
    return calculateAllServiceFees(
        subTotal.value.totalWithTax,
        [
            platformServiceFee,
            supportPartnerServiceFee,
            marketingPartnerServiceFee
        ],
        taxSettings.taxRateForServiceFees ?? 0
    )
})

const tolerableServiceFeeAmount = computed(() => {
    return tolerableServiceFee(subTotal.value.totalWithTax, tolerableServiceFeeRate, calculationType)
})

const discountAmount = computed(() => {
    return calculateDiscount(offerDiscountIfPossible, tolerableServiceFeeAmount.value, serviceFeeForThisOrder.value.totalWithTax)
})

const serviceFeeAmountForBuyer = computed(() => {
    return serviceFeeAmountNeedToPayByBuyer(
        serviceFeeForThisOrder.value.totalWithTax,
        tolerableServiceFeeAmount.value,
        taxSettings.taxRateForServiceFees ?? 0
    )
})

const currentCart = computed(() => {
    return userDataStore.value.userData?.carts?.[genCartId(window.storeData?.id!)];
});

const buyerPaysTotal = computed(() => {
    return buyerPays(
        subTotal.value,
        serviceFeeAmountForBuyer.value,
        discountAmount.value,
    )
})

const stripeFee = computed(() => {
    return calculateStripeFee(buyerPaysTotal.value.totalWithTax)
})

const buyerPaysTotalWithStripe = computed(() => {
    if (isStripe.value) {
        return roundTo2Decimals(buyerPaysTotal.value.totalWithTax + stripeFee.value)
    }
    return buyerPaysTotal.value.totalWithTax;
})

const storeReceivesTotal = computed(() => {
    return storeReceives(
        buyerPaysTotal.value,
        serviceFeeForThisOrder.value,
    )
})

let menuRoot = ref<MenuRoot | null>(null);
let taxSettings = window.storeData?.taxSettings as TaxSettings;

onMounted(() => {
    if (typeof window !== "undefined") {
        menuRoot.value = window.storeData?.menu?.menuRoot ?? null;
    }
});

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

const bestDeliveryZone = computed(() => {
    return getBestDeliveryZone(
        {
            lat: userDataStore.value.userData?.rememberLastLat!,
            lng: userDataStore.value.userData?.rememberLastLng!
        },
        window.storeData?.deliveryZones?.zones ?? [],
        {
            lat: window.storeData?.address?.lat!,
            lng: window.storeData?.address?.lng!
        }
    );
})

const subTotal = computed(() => {
    if (!currentCart.value || !menuRoot.value) return { totalWithTax: 0, tax: 0, calculatedCustomServiceFees: [] };
    return calculateSubTotal(
        currentCart.value, menuRoot.value, taxSettings, orderType,
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

const deliveryFeeTax = computed(() => {
    return calculateFeeTax(bestDeliveryZone.value?.totalDeliveryFee ?? 0, taxSettings.salesTaxType ?? 'ITEMS_PRICES_ALREADY_INCLUDE_TAXES', taxSettings.taxRateForDelivery ?? 0);
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
                        <span class="font-bold">
                            {{ getPrice(item).itemPrice }}
                            tax:{{ getPrice(item).tax }}
                        </span>
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
                        items total
                    </span>
                    <span class="font-bold text-lg">
                        {{ cartTotals.totalPrice }}

                        tax:{{ cartTotals.tax }}
                    </span>
                </div>

                <div class="flex justify-between items-center px-1"
                     v-if="orderType === 'delivery'">
                    <span class="">
                        Delivery Fee
                    </span>
                    <span class="font-bold text-lg">
                        {{ bestDeliveryZone?.totalDeliveryFee }}

                        tax:{{ deliveryFeeTax }}
                    </span>
                </div>

                <div class="flex justify-between items-center px-1"
                     v-for="customSFee in subTotal.calculatedCustomServiceFees"
                     :key="customSFee.name">
                    <span class="">
                        {{ customSFee.name }}
                    </span>
                    <span class="font-bold text-lg">
                        {{ customSFee.shownFee }}
                        tax:{{ customSFee.tax }}
                    </span>
                </div>

                <div class="flex justify-between items-center px-1">
                    <span class="font-bold text-lg">
                        Subtotal
                    </span>
                    <span class="font-bold text-lg text-right">
                        <details>
                            <summary>
                                tax
                            </summary>
                            <p>
                                {{ subTotal.tax }}
                            </p>
                        </details>
                        {{ subTotal.totalWithTax }}
                    </span>
                </div>

                <!-- <div class="flex justify-between items-center px-1">
                    <span class="font-bold text-lg">
                        Allowed Service Fee
                    </span>
                    <span class="font-bold text-lg">
                        {{ tolerableServiceFeeAmount }}
                    </span>
                </div> -->

                <div class="flex justify-between items-center px-1">
                    <span class="font-bold text-lg">
                        Service Fee for Buyer
                    </span>
                    <span class="font-bold text-lg">
                        {{ serviceFeeAmountForBuyer }}
                    </span>
                </div>

                <div class="flex justify-between items-center px-1 text-primary"
                     v-if="discountAmount > 0">
                    <span class="font-bold text-lg">
                        Discount
                    </span>
                    <span class="font-bold text-lg text-right">
                        <details>
                            <summary>
                                - {{ discountAmount }}
                            </summary>
                            <p>
                                Discounts do not apply to taxes
                            </p>
                        </details>
                    </span>
                </div>

                <div class="flex justify-between items-center px-1">
                    <Label class="text-right">
                        Stripe ({{ isStripe ? `enabled ${stripeFee}` : "disabled" }})
                    </Label>
                    <Switch :checked="isStripe"
                            @update:checked="(checked) => isStripe = checked"
                            class="scale-125">
                    </Switch>
                </div>

                <div class="flex justify-between items-center px-1">
                    <span class="font-bold text-2xl">
                        Buyer Pays
                    </span>
                    <span class="font-bold text-2xl">
                        <details>
                            <summary>
                                {{ buyerPaysTotalWithStripe }}
                            </summary>
                            <p>
                                {{ buyerPaysTotal }}
                            </p>
                        </details>
                    </span>
                </div>

                <div class="flex justify-between items-center px-1 border-t border-muted-foreground">
                    <span class="font-bold text-lg">
                        Service Fee
                    </span>
                    <span class="font-bold text-lg">
                        {{ serviceFeeForThisOrder }}
                    </span>
                </div>

                <div class="flex justify-between items-center px-1 border-t border-muted-foreground">
                    <span class="font-bold text-lg">
                        Store Receives
                    </span>
                    <span class="font-bold text-lg">
                        {{ storeReceivesTotal }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>