<script lang="ts" setup>
import HeaderOnly from '@dashboard-spa-vue/layouts/HeaderOnly.vue';
import AppLinks from '@dashboard-spa-vue/components/AppLinks.vue';

</script>

<template>
	<HeaderOnly>
		<main class="flex flex-1 flex-col gap-4 lg:gap-6 lg:p-6">
			<div class="flex flex-col gap-1">
				<h3 class="text-2xl font-bold tracking-tight">Dashboard</h3>
				<!-- <p class="text-muted-foreground text-sm">Apps to help you run your store.</p>
				<p class="text-muted-foreground text-sm">Start with a new store or manage existing ones.</p> -->
			</div>
			<div class="rounded-lg border border-dashed shadow-sm">
				<div class="mx-auto sm:max-w-[50%]">
					<AppLinks />
				</div>
			</div>
		</main>
	</HeaderOnly>
</template>
