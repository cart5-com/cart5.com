<script setup lang="ts">
import { ShoppingCart } from "lucide-vue-next";
const VITE_PUBLIC_DOMAIN_NAME = import.meta.env.VITE_PUBLIC_DOMAIN_NAME
</script>

<template>
	<div class="my-10 flex items-center justify-center text-center">
		<ShoppingCart class="mr-2 h-7 w-7" />
		<h1 class="text-2xl font-bold">{{ VITE_PUBLIC_DOMAIN_NAME }}</h1>
	</div>
</template>
