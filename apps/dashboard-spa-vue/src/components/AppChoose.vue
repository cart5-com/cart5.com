<script setup lang="ts">
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { LayoutGrid } from "lucide-vue-next";
import AppLinks from "@dashboard-spa-vue/components/AppLinks.vue";
</script>

<template>
	<div class="flex items-center justify-end">
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="secondary"
						size="icon"
						class="rounded-full">
					<LayoutGrid class="h-5 w-5" />
				</Button>
			</PopoverTrigger>
			<PopoverContent class="bg-accent max-h-[50vh] overflow-y-auto">
				<AppLinks />
			</PopoverContent>
		</Popover>
	</div>
</template>
