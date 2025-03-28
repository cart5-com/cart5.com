<script setup lang="ts">
import { userCartsStore } from "./UserCarts.Store";
import { computed, onMounted, ref } from "vue";
import { calculateCartItemPrice, generateCartItemTextSummary, type MenuRoot } from "@lib/types/menuType";

const currentCart = computed(() => {
  return userCartsStore.value?.carts?.find((cart) => cart.restaurantId === window.restaurantId
  );
});

let menuRoot = ref<MenuRoot | null>(null);

onMounted(() => {
  if (typeof window !== "undefined") {
    menuRoot.value = window.menuRoot;
  }
});

</script>

<template>
  <div class="flex flex-col gap-2"
       v-if="menuRoot">
    <div v-if="currentCart?.items?.length"
         class="flex flex-col gap-2 absolute">
      <div class="bg-card text-card-foreground relative sticky top-0 z-40 border shadow-sm">STICKY</div>
      <div v-for="(item, index) in currentCart?.items"
           :key="item.itemId ?? index">
        <div class="whitespace-pre-wrap text-xs bg-muted p-2 rounded-md my-2">
          {{ generateCartItemTextSummary(item, menuRoot) }}
          <div class="text-sm font-medium">
            ${{ calculateCartItemPrice(item, menuRoot) }}
          </div>
        </div>
      </div>
      {{Array.from({ length: 1000 }, (_, index) => `item ${index}`)}}
    </div>
    <div v-else>
      <span class="text-sm font-medium">
        Add some items here
      </span>
    </div>

  </div>
</template>