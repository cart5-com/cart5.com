<script setup lang="ts">
import { ShoppingCart } from "lucide-vue-next";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { userCartsStore } from "./UserCarts.Store";
import { Badge } from "@/components/ui/badge";
import { computed, onMounted, ref } from "vue";
import { calculateCartItemPrice, generateCartItemTextSummary, type MenuRoot } from "@lib/types/menuType";

const currentCart = computed(() => {
  return userCartsStore.value?.carts?.find((cart) => cart.restaurantId === window.restaurantId
  );
});

const totalItem = computed(() => {
  return currentCart.value?.items?.reduce((acc, item) => acc + (item.quantity ?? 0), 0) ?? 0;
});

let menuRoot = ref<MenuRoot | null>(null);

onMounted(() => {
  if (typeof window !== "undefined") {
    menuRoot.value = window.menuRoot;
  }
});

</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button variant="outline">
        <ShoppingCart />
        <Badge>
          {{ totalItem }}
        </Badge>
      </Button>
    </PopoverTrigger>
    <PopoverContent side="bottom"
                    align="end"
                    class="max-w-md w-full">
      <div class="flex flex-col gap-2"
           v-if="menuRoot">
        <div v-if="currentCart?.items?.length"
             class="flex flex-col gap-2">
          <div v-for="(item, index) in currentCart?.items"
               :key="item.itemId ?? index">
            <div class="whitespace-pre-wrap text-xs bg-muted p-2 rounded-md my-2">
              {{ generateCartItemTextSummary(item, menuRoot) }}
              <div class="text-sm font-medium">
                ${{ calculateCartItemPrice(item, menuRoot) }}
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <span class="text-sm font-medium">
            Add some items here
          </span>
        </div>

      </div>
    </PopoverContent>
  </Popover>
</template>