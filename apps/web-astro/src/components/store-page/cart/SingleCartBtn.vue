<script setup lang="ts">
import { ShoppingCart } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { userDataStore } from "../../../stores/UserData.store";
import { Badge } from "@/components/ui/badge";
import { computed } from "vue";
import { genCartId } from "../../../stores/UserData.store";
import { type CartItem } from "@lib/zod/cartItemState";

const currentCart = computed(() => {
  return userDataStore.value?.userData?.carts?.[genCartId(window.storeData?.id ?? "")];
});

const totalItem = computed(() => {
  return currentCart.value?.items?.reduce((acc: number, item: CartItem) => acc + (item.quantity ?? 0), 0) ?? 0;
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