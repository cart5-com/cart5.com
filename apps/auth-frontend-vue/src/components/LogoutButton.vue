<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { getAuthApiClient } from "@src/lib/authApiClient";
import { $userStore } from "@src/stores/userStore";

async function handleLogout() {
	const { data, error } = await (await getAuthApiClient().api.user["logout-all"].$post()).json();
	console.log(data, error);
	$userStore.set(null);
}
</script>

<template>
	<Button class="w-full"
			variant="secondary"
			@click="handleLogout">
		Logout
	</Button>
</template>
