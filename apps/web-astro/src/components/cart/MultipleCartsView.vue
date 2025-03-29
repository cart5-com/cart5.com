<script setup lang="ts">
import { ShoppingCart } from "lucide-vue-next";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { userCartsStore } from "./UserCarts.Store";
import { BASE_LINKS } from "@web-astro/utils/links";
import { slugify } from "@lib/utils/slugify";
import type { Cart } from "@lib/types/UserLocalStorageTypes";
import { Badge } from "@/components/ui/badge";
import { computed } from "vue";

const getTotalItem = (cart: Cart) => {
  return cart.items?.reduce((acc, item) => acc + (item.quantity ?? 0), 0) ?? 0;
};

const getAllCartsQuantity = () => {
  return userCartsStore.value?.carts?.reduce((acc: number, cart: Cart) => acc + getTotalItem(cart), 0) ?? 0;
};

const computedCartsQuantity = computed(() => {
  return getAllCartsQuantity();
});

</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button variant="outline">
        <ShoppingCart />
        <Badge>
          {{ computedCartsQuantity }}
        </Badge>
      </Button>
    </PopoverTrigger>
    <PopoverContent side="bottom"
                    align="end"
                    class="max-w-md w-full">
      <div class="flex flex-col gap-2">
        <div v-if="userCartsStore"
             class="flex flex-col gap-2">
          <div v-for="(cart, index) in userCartsStore?.carts"
               :key="cart.id ?? index">
            <Button as="a"
                    variant="outline"
                    :href="`${BASE_LINKS.STORE(cart.storeId ?? '', slugify(cart.storeName ?? ''))}?cartId=${cart.id}`"
                    class="grid grid-cols-[auto_1fr_auto] gap-2 w-full">
              <ShoppingCart class="flex-shrink-0" />
              <span class="truncate">
                {{ cart.storeName }}
              </span>
              <Badge class="text-sm font-medium flex-shrink-0">
                {{ getTotalItem(cart) }}
              </Badge>
            </Button>
          </div>
          <div v-if="userCartsStore?.carts?.length === 0">
            <span class="text-sm font-medium">
              No carts
              <br />
              - Open a store
              <br />
              - Add some items here
            </span>
          </div>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>