<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { ROUTES } from "@src/const";
import { getAuthApiClient } from "@src/lib/authApiClient";
import { $userStore, saveUserToSession } from "@src/stores/userStore";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();


async function handleLogout() {
	const { data, error } = await (await getAuthApiClient().api.user["logout-all"].$post()).json();
	console.log(data, error);
	$userStore.set(null);
	saveUserToSession(null);
	// window.location.reload();
	router.push({ path: ROUTES.LOGIN, query: { ...route.query, pathname: ROUTES.USER.SETTINGS } });
}
</script>

<template>
	<Button class="w-full"
			variant="secondary"
			@click="handleLogout">
		Logout
	</Button>
</template>
