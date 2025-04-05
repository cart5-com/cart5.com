<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { authGlobalApiClient } from "@api-client/auth_global";
import { userStore } from "@auth-frontend-vue/stores/User.store";

async function handleLogout() {
	const { data, error } = await (await authGlobalApiClient["logout-all"].$post()).json();
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
