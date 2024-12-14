<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useColorMode } from "@vueuse/core";
import { Moon, Sun } from "lucide-vue-next";

// Pass { disableTransition: false } to enable transitions
const mode = useColorMode();
</script>

<template>
	<DropdownMenu>
		<DropdownMenuTrigger as-child>
			<Button variant="secondary"
					size="icon"
					class="rounded-full">
				<Moon class="block dark:hidden" />
				<Sun class="hidden dark:block" />
			</Button>
		</DropdownMenuTrigger>
		<DropdownMenuContent align="start">
			<DropdownMenuItem @click="mode = 'light'"> Light </DropdownMenuItem>
			<DropdownMenuItem @click="mode = 'dark'"> Dark </DropdownMenuItem>
			<DropdownMenuItem @click="mode = 'auto'"> System </DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
</template>
