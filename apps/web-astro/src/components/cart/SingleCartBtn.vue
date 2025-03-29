<script setup lang="ts">
import { ShoppingCart } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { userCartsStore } from "./UserCarts.Store";
import { Badge } from "@/components/ui/badge";
import { computed } from "vue";

const currentCart = computed(() => {
  return userCartsStore.value?.carts?.find((cart) => cart.storeId === window.storeId
  );
});

const totalItem = computed(() => {
  return currentCart.value?.items?.reduce((acc, item) => acc + (item.quantity ?? 0), 0) ?? 0;
});


</script>

<template>
  <Button variant="outline"
          as="label"
          for="right-drawer"
          class="cursor-pointer">
    <ShoppingCart />
    <Badge>
      {{ totalItem }}
    </Badge>
  </Button>
</template>