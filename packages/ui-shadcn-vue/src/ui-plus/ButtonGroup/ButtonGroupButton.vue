<script setup lang="ts">
interface Props {
	href?: string,
	active?: boolean
}

defineProps<Props>()
</script>

<template>
	<a role="tab"
	   :aria-selected="active"
	   :data-state="active ? 'active' : 'inactive'"
	   tabindex="-1"
	   :href="href"
	   class="ring-offset-background focus-visible:ring-ring data-[state=active]:bg-background data-[state=active]:text-foreground inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm w-full">
		<span class="truncate">
			<slot />
		</span>
	</a>
</template>
