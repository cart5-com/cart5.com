<script setup lang="ts">
import { userDataStore } from "../../stores/UserData.store";
import { removeItemFromCart, openItemInCart, clearCartByStoreId, genCartId } from "../../stores/UserDataCartHelpers";
import { computed, onMounted, ref } from "vue";
import { Minus, Trash2, X, Plus, MoreVerticalIcon, ListX, Pencil } from "lucide-vue-next";
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
import type { TaxSettings } from "@lib/types/taxTypes";
import type { OrderType } from "@lib/types/orderType";
import { getBestDeliveryZone } from "@lib/utils/deliveryZoneFilterByLocation";

const currentCart = computed(() => {
  return userDataStore.value.userData?.carts?.[genCartId(window.storeData?.id!)];
});


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
  if (!currentCart.value || !menuRoot.value) return { totalPrice: "$0.00", tax: "$0.00" };
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

</script>

<template>
  <div class="flex flex-col gap-2 h-full"
       v-if="menuRoot">
    <div class="flex flex-col gap-2 absolute w-full">
      <div class="bg-card text-card-foreground relative sticky top-0 z-40 max-w-full flex justify-between items-center">
        <Button variant="outline"
                as="label"
                for="right-drawer"
                class="cursor-pointer rounded-b-md m-1 flex-shrink-0">
          <X class="h-8 w-8" />
        </Button>
        <div class="max-w-full overflow-x-scroll px-2 whitespace-nowrap no-scrollbar text-2xl font-bold">
          {{ currentCart?.storeName }}
        </div>
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
                <NumberFieldDecrement class="bg-secondary rounded-l-md hover:bg-secondary/60 cursor-pointer">
                  <Trash2 class="h-4 w-4"
                          v-if="item.quantity! === 1" />
                  <Minus class="h-4 w-4"
                         v-else />
                </NumberFieldDecrement>
                <NumberFieldInput />
                <NumberFieldIncrement class="bg-secondary rounded-r-md hover:bg-secondary/60 cursor-pointer" />
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
              <div class="max-w-full overflow-x-scroll px-2 whitespace-nowrap no-scrollbar text-xl justify-start">
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
                          maxlength="800"
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
            Subtotal
          </span>
          <span class="font-bold text-lg">
            {{ cartTotals.totalPrice }}

            tax:{{ cartTotals.tax }}
          </span>
        </div>

        <div class="flex justify-between items-center px-1"
             v-if="orderType === 'delivery'">
          <details open>
            <summary>
              Best Delivery Zone
            </summary>
            <pre class="text-sm">{{ bestDeliveryZone }}</pre>
          </details>
        </div>
        <div
             class="bg-card text-card-foreground relative sticky bottom-0 z-40 max-w-full flex justify-between items-center p-4">
          <Button variant="default"
                  class="w-full">
            Checkout
          </Button>
        </div>
      </div>
      <!-- {{Array.from({ length: 1000 }, (_, index) => `item ${index}`)}} -->
      <div v-if="!currentCart || currentCart?.items?.length === 0"
           class="flex-1">
        Click
        <Plus class="inline-block border border-foreground rounded-md" />
        to add items to cart
      </div>
    </div>

  </div>
</template>