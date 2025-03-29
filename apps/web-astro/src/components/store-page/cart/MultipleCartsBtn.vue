<script setup lang="ts">
import { ShoppingCart } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { userStore } from "../../../stores/User.store";
import type { Cart } from "@lib/types/UserLocalStorageTypes";
import { Badge } from "@/components/ui/badge";
import { computed, onMounted } from "vue";
import { initializeUserStore } from "@web-astro/stores/User.store";

const getTotalItem = (cart: Cart) => {
  return cart.items?.reduce((acc, item) => acc + (item.quantity ?? 0), 0) ?? 0;
};

const getAllCartsQuantity = () => {
  return userStore.value?.carts?.reduce((acc: number, cart: Cart) => acc + getTotalItem(cart), 0) ?? 0;
};

const computedCartsQuantity = computed(() => {
  return getAllCartsQuantity();
});

onMounted(() => {
  initializeUserStore();
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