<script setup lang="ts">
import { ShoppingCart } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { userDataStore } from "../../../stores/UserData.store";
import { Badge } from "@/components/ui/badge";
import { computed } from "vue";
import { type Cart } from "@lib/zod/cartItemState";

const getTotalItem = (cart: Cart) => {
  return cart.items?.reduce((acc, item) => acc + (item.quantity ?? 0), 0) ?? 0;
};

const getAllCartsQuantity = () => {
  return Object.values(userDataStore.value?.userData?.carts ?? {}).reduce((acc: number, cart: Cart) => acc + getTotalItem(cart), 0) ?? 0;
};

const computedCartsQuantity = computed(() => {
  return getAllCartsQuantity();
});

</script>

<template>
  <Button variant="outline"
          as="label"
          for="right-drawer"
          class="cursor-pointer">
    <ShoppingCart />
    <Badge>
      {{ computedCartsQuantity }}
    </Badge>
  </Button>
</template>