<script lang="ts" setup>
import { Store } from 'lucide-vue-next';
</script>

<template>
	<div class="grid grid-cols-3 gap-4 p-4">
		<RouterLink :to="{ name: 'my-restaurants' }"
					class="bg-accent hover:bg-accent/80 flex flex-col items-center justify-center rounded-lg p-2 transition-colors">
			<Store class="text-muted-foreground h-10 w-10" />
			<span class="text-foreground mt-2 text-sm">My Restaurants</span>
		</RouterLink>
	</div>
</template>
