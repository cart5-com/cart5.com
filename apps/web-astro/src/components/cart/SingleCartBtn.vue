<script setup lang="ts">
import { ShoppingCart } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { userDataStore } from "../../stores/UserData.store";
import { Badge } from "@/components/ui/badge";
import { computed } from "vue";
import { genCartId } from "../../stores/UserDataCartHelpers";
import { type CartItem } from "@lib/zod/cartItemState";

const currentCart = computed(() => {
  return userDataStore.value?.userData?.carts?.[genCartId(window.storeData?.id ?? "")];
});

const totalItem = computed(() => {
  return currentCart.value?.items?.reduce((acc: number, item: CartItem) => acc + (item.quantity ?? 0), 0) ?? 0;
});

</script>

<template>
  <div>
    <Button variant="outline"
            as="label"
            for="right-drawer"
            class="cursor-pointer">
      <ShoppingCart />
      <Badge>
        {{ totalItem }}
      </Badge>
    </Button>
    <div class="block md:hidden fixed bottom-0 left-0 right-0 z-40 max-w-full w-full"
         v-if="totalItem > 0">
      <Button variant="outline"
              as="label"
              size="lg"
              for="right-drawer"
              class="cursor-pointer w-full h-12 rounded-none">
        <ShoppingCart />
        <Badge>
          {{ totalItem }}
        </Badge>
        <span class="text-xs truncate max-w-1/2">
          {{ currentCart?.storeName }}
        </span>
      </Button>
    </div>
  </div>
</template>