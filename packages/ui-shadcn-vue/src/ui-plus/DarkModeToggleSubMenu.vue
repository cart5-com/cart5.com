<script setup lang="ts">
import {
	DropdownMenuItem,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuPortal
} from "@/components/ui/dropdown-menu";
import { useColorMode } from "@vueuse/core";
import { Monitor, Moon, Sun } from "lucide-vue-next";

// Pass { disableTransition: false } to enable transitions
const mode = useColorMode();
</script>

<template>
	<DropdownMenuSub>
		<DropdownMenuSubTrigger>
			<Moon v-if="mode === 'dark'"
				  class="mr-2 h-4 w-4" />
			<Sun v-else-if="mode === 'light'"
				 class="mr-2 h-4 w-4" />
			<span class="capitalize">{{ mode }}</span>
		</DropdownMenuSubTrigger>
		<DropdownMenuPortal>
			<DropdownMenuSubContent>
				<DropdownMenuItem @click="mode = 'light'">
					<Sun />
					Light
				</DropdownMenuItem>
				<DropdownMenuItem @click="mode = 'dark'">
					<Moon />
					Dark
				</DropdownMenuItem>
				<DropdownMenuItem @click="mode = 'auto'">
					<Monitor />
					System
				</DropdownMenuItem>
			</DropdownMenuSubContent>
		</DropdownMenuPortal>
	</DropdownMenuSub>
</template>
