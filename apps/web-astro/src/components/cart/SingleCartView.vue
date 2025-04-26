<script setup lang="ts">
import { userDataStore } from "../../stores/UserData.store";
import { clearCartByStoreId, genCartId } from "../../stores/UserDataCartHelpers";
import { computed } from "vue";
import { X, Plus, MoreVerticalIcon, ListX } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BASE_LINKS } from "@web-astro/utils/links";
import { slugify } from "@lib/utils/slugify";
import CartView from "@web-astro/components/checkout/CartView.vue";

const currentCart = computed(() => {
  return userDataStore.value.userData?.carts?.[genCartId(window.storeData?.id!)];
});

const removeAllItemsFromCart = () => {
  clearCartByStoreId(currentCart.value?.storeId!);
}


</script>

<template>
  <div class="flex flex-col gap-2 h-full">
    <div class="flex flex-col gap-2 absolute w-full">
      <div class="bg-card text-card-foreground relative sticky top-0 z-40 max-w-full flex justify-between items-center">
        <Button variant="outline"
                as="label"
                for="right-drawer"
                class="cursor-pointer rounded-b-md m-1 flex-shrink-0">
          <X class="h-8 w-8" />
        </Button>
        <div class="max-w-full overflow-x-scroll px-2 whitespace-nowrap no-scrollbar text-2xl font-bold">
          {{ currentCart?.storeName }}
        </div>
        <div class="flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <MoreVerticalIcon class="cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end"
                                 class="">

              <DropdownMenuItem @click="removeAllItemsFromCart">
                <ListX />
                Clear Cart
              </DropdownMenuItem>


            </DropdownMenuContent>
          </DropdownMenu>
        </div><!-- Spacer to balance the layout -->
      </div>
      <div class="flex-1"
           v-if="currentCart && currentCart.items">

        <CartView />

        <div
             class="bg-card text-card-foreground relative sticky bottom-0 z-40 max-w-full flex justify-between items-center p-4">
          <Button variant="default"
                  as="a"
                  :href="BASE_LINKS.CHECKOUT(currentCart?.storeId!, slugify(currentCart?.storeName!))"
                  class="w-full">
            Checkout
          </Button>
        </div>
      </div>
      <!-- {{Array.from({ length: 1000 }, (_, index) => `item ${index}`)}} -->
      <div v-if="!currentCart || currentCart?.items?.length === 0"
           class="flex-1">
        Click
        <Plus class="inline-block border border-foreground rounded-md" />
        to add items to cart
      </div>
    </div>

  </div>
</template>