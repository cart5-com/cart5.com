<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { apiClient } from "@api-client/index";
import { userStore } from "@auth-frontend-vue/stores/userStore";

async function handleLogout() {
	const { data, error } = await (await apiClient.auth_global["logout-all"].$post()).json();
	console.log(data, error);
	userStore.value = null;
}
</script>

<template>
	<Button class="w-full"
			variant="secondary"
			@click="handleLogout">
		{{ $t('logout') }}
	</Button>
</template>
