<script setup lang="ts">
import { User } from "lucide-vue-next";
import { extractBaseDomain } from '@lib/utils/extractBaseDomain';
import { queryParamsStore } from '@auth-frontend-vue/stores/QueryParams.store';
const DOMAIN_NAME = extractBaseDomain(
	new URL(
		queryParamsStore.value.next ||
		import.meta.env.VITE_PUBLIC_DOMAIN_NAME
	).host
);
</script>

<template>
	<div class="my-10 flex items-center justify-center text-center">
		<User class="mr-2 h-7 w-7" />
		<h1 class="text-2xl font-bold">{{ DOMAIN_NAME }}</h1>
	</div>
</template>
