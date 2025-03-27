<script setup lang="ts">
import { generateCartItemTextSummary } from '@lib/types/menuType';
import { cartStore } from './Cart.Store';
import { showItemModal } from './showItemModal';
const menuRoot = window.menuRoot;

</script>

<template>
    <div>
        <h1>Cart</h1>
        <ul>
            <li v-for="(cartItem, index) in cartStore"
                :key="cartItem.itemId"
                class="cursor-pointer">
                <pre @click="showItemModal(cartItem.itemId!, cartItem, index)"
                     class="text-xs max-w-full overflow-auto">{{ generateCartItemTextSummary(cartItem, menuRoot) }}
                </pre>
            </li>
            <li>
                <Button>Checkout</Button>
            </li>
        </ul>
    </div>
</template>