<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { getAuthGlobalApiClient } from "@src/lib/authApiClient";
import { userStore } from "@src/stores/userStore";

async function handleLogout() {
	const { data, error } = await (await getAuthGlobalApiClient().api_auth_global["logout-all"].$post()).json();
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
