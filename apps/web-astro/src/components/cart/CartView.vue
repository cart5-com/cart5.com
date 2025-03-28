<script setup lang="ts">
import { userCartsStore, removeItemFromCart } from "./UserCarts.Store";
import { computed, onMounted, ref } from "vue";
import { Minus, Trash2, X, Plus } from "lucide-vue-next";
import { calculateCartItemPrice, generateCartItemTextSummary, type CartItem, type MenuRoot } from "@lib/types/menuType";
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

</script>

<template>
  <div class="flex flex-col gap-2"
       v-if="menuRoot">
    <div v-if="currentCart?.items?.length"
         class="flex flex-col gap-2 absolute w-full">
      <div class="bg-card text-card-foreground relative sticky top-0 z-40 border shadow-sm">
        <Button variant="outline"
                as="label"
                for="right-drawer"
                class="cursor-pointer">
          <X class="h-8 w-8" />
        </Button>
      </div>
      <div v-for="(item, index) in currentCart?.items"
           :key="item.itemId ?? index">
        <div class="whitespace-pre-wrap bg-card  p-2 my-2">
          <div class="font-bold text-lg">
            {{ menuRoot.allItems?.[item.itemId!]?.lbl }}
          </div>
          {{ generateCartItemTextSummary(item, menuRoot) }}
          <div class="font-medium">
            <NumberField id="quantity"
                         class="max-w-40 mt-8 border border-foreground rounded-md bg-background"
                         v-model="item.quantity!"
                         :default-value="1"
                         @update:model-value="updateCartItemQuantity(item, index)"
                         :step="1"
                         :min="0">
              <NumberFieldContent>
                <NumberFieldDecrement class="hidden sm:block bg-secondary rounded-l-md hover:bg-secondary/60">
                  <Trash2 class="h-4 w-4"
                          v-if="item.quantity! === 1" />
                  <Minus class="h-4 w-4"
                         v-else />
                </NumberFieldDecrement>
                <NumberFieldInput />
                <NumberFieldIncrement class="hidden sm:block bg-secondary rounded-r-md hover:bg-secondary/60" />
              </NumberFieldContent>
            </NumberField>
            ${{ calculateCartItemPrice(item, menuRoot) }}
          </div>
        </div>
      </div>
      <!-- {{Array.from({ length: 1000 }, (_, index) => `item ${index}`)}} -->
    </div>
    <div v-else>
      Click
      <Plus class="inline-block" />
      to add items to cart
    </div>

  </div>
</template>