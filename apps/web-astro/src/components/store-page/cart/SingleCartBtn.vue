<script setup lang="ts">
import { ShoppingCart } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { userLocalStore } from "../../../stores/UserLocal.store";
import { Badge } from "@/components/ui/badge";
import { computed, onMounted } from "vue";
import { initializeUserLocalStore } from "@web-astro/stores/UserLocal.store";

const currentCart = computed(() => {
  return userLocalStore.value?.carts?.find((cart) => cart.storeId === window.storeData?.id
  );
});

const totalItem = computed(() => {
  return currentCart.value?.items?.reduce((acc, item) => acc + (item.quantity ?? 0), 0) ?? 0;
});

onMounted(() => {
  initializeUserLocalStore();
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