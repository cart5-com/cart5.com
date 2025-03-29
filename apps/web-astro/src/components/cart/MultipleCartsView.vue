<script setup lang="ts">
import { MoreVerticalIcon, ShoppingCart, Trash } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { userCartsStore, clearCartByCartId } from "./UserCarts.Store";
import { BASE_LINKS } from "@web-astro/utils/links";
import { slugify } from "@lib/utils/slugify";
import type { Cart } from "@lib/types/UserLocalStorageTypes";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const getTotalItem = (cart: Cart) => {
  return cart.items?.reduce((acc, item) => acc + (item.quantity ?? 0), 0) ?? 0;
};

const removeCart = (cartId: string) => {
  clearCartByCartId(cartId);
};

</script>

<template>
  <div class="flex flex-col gap-2 max-w-md w-full">
    <div v-if="userCartsStore"
         class="flex flex-col gap-2 p-2">
      <div v-for="(cart, index) in userCartsStore?.carts"
           :key="cart.id ?? index"
           class="flex flex-row gap-2 items-center rounded-md border p-2">
        <Button as="a"
                variant="ghost"
                :href="`${BASE_LINKS.STORE(cart.storeId ?? '', slugify(cart.storeName ?? ''))}?cartId=${cart.id}`"
                class="grid grid-cols-[auto_1fr_auto] gap-2 flex-1">
          <ShoppingCart class="flex-shrink-0" />
          <span class="truncate">
            {{ cart.storeName ?? 'Name not found' }}
          </span>
          <Badge class="text-sm font-medium flex-shrink-0">
            {{ getTotalItem(cart) }}
          </Badge>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <MoreVerticalIcon class="cursor-pointer" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end"
                               class="">

            <DropdownMenuItem @click="removeCart(cart.id!)">
              <Trash />
              Remove Cart
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
</template>