<script setup lang="ts">
import { userCartsStore, removeItemFromCart, openItemInCart } from "./UserCarts.Store";
import { computed, onMounted, ref } from "vue";
import { Minus, Trash2, X, Plus } from "lucide-vue-next";
import { type CartItem, type MenuRoot } from "@lib/types/menuType";
import { calculateCartItemPrice } from "@lib/utils/calculateCartItemPrice";
import { generateCartItemTextSummary } from "@lib/utils/generateCartItemTextSummary";
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/components/ui/number-field'
import { Button } from "@/components/ui/button";

const currentCart = computed(() => {
  return userCartsStore.value?.carts?.find((cart) => cart.restaurantId === window.restaurantId
  );
});


let menuRoot = ref<MenuRoot | null>(null);

onMounted(() => {
  if (typeof window !== "undefined") {
    menuRoot.value = window.menuRoot;
  }
});

const updateCartItemQuantity = (item: CartItem, itemIndex: number) => {
  if (item.quantity! === 0) {
    removeItemFromCart(window.restaurantId, itemIndex);
  }
}

const openCartItem = (itemIndex: number) => {
  openItemInCart(window.restaurantId, itemIndex);
}

</script>

<template>
  <div class="flex flex-col gap-2"
       v-if="menuRoot">
    <div class="flex flex-col gap-2 absolute w-full h-full ">
      <div class="bg-card text-card-foreground relative sticky top-0 z-40 max-w-full flex justify-between items-center">
        <Button variant="outline"
                as="label"
                for="right-drawer"
                class="cursor-pointer rounded-b-md m-1 flex-shrink-0">
          <X class="h-8 w-8" />
        </Button>
        <div class="max-w-full overflow-x-scroll px-2 whitespace-nowrap no-scrollbar">
          {{ currentCart?.restaurantName }}
        </div>
        <div class="w-10 m-1 flex-shrink-0"></div><!-- Spacer to balance the layout -->
      </div>
      <div v-for="(item, index) in currentCart?.items"
           class="flex-1 border-b border-muted-foreground pb-2"
           :key="item.itemId ?? index">
        <div class="whitespace-pre-wrap px-2 mb-2">
          <div class="cursor-pointer"
               @click="openCartItem(index)">
            <div class="font-bold text-lg">
              {{ menuRoot.allItems?.[item.itemId!]?.lbl }}
            </div>
            {{ generateCartItemTextSummary(item, menuRoot) }}
          </div>
        </div>
        <div class="font-medium flex justify-between items-center">
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
          ${{ calculateCartItemPrice(item, menuRoot) }}
        </div>
      </div>
      <!-- {{Array.from({ length: 1000 }, (_, index) => `item ${index}`)}} -->
      <div v-if="!currentCart || currentCart?.items?.length === 0"
           class="flex-1">
        Click
        <Plus class="inline-block border border-foreground rounded-md" />
        to add items to cart
      </div>
      <div
           class="bg-card text-card-foreground relative sticky bottom-0 z-40 max-w-full flex justify-between items-center p-4">
        <Button variant="outline"
                class="w-full">
          Checkout
        </Button>
      </div>
    </div>

  </div>
</template>