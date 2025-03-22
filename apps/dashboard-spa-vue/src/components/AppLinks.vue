<script setup lang="ts">
import {
	// MailIcon,
	// CalendarIcon,
	// FileTextIcon,
	// ImageIcon,
	// SettingsIcon,
	// ChartBarIcon,
	// CreditCardIcon,
	// HelpCircleIcon,
	// BoxIcon,
	// UsersIcon,
	// MenuIcon,
	// GlobeIcon,
	Store,
	Globe,
	Home
} from "lucide-vue-next";

// const apps = [
// 	// { name: "Business", icon: BriefcaseIcon },
// 	// { name: "Website", icon: GlobeIcon },
// 	{ name: "Orders", icon: BoxIcon },
// 	{ name: "Customers", icon: UsersIcon },
// 	{ name: "Menu", icon: MenuIcon },

// 	{ name: "Mail", icon: MailIcon },
// 	{ name: "Calendar", icon: CalendarIcon },
// 	{ name: "Drive", icon: FileTextIcon },
// 	{ name: "Photos", icon: ImageIcon },
// 	{ name: "Settings", icon: SettingsIcon },
// 	{ name: "Tasks", icon: CalendarIcon },
// 	{ name: "Analytics", icon: ChartBarIcon },
// 	{ name: "Finance", icon: CreditCardIcon },
// 	{ name: "Settings", icon: SettingsIcon },
// 	{ name: "Help", icon: HelpCircleIcon }
// ];
// console.log(apps);
</script>
<template>
	<div class="grid md:grid-cols-3 gap-4 p-2 lg:p-4">
		<RouterLink :to="{ name: 'home' }"
					class="bg-muted hover:bg-muted/80 flex flex-col items-center justify-center rounded-lg p-2 transition-colors">
			<Home class="text-muted-foreground h-10 w-10" />
			<span class="text-foreground mt-2 text-sm text-center">Home</span>
		</RouterLink>
		<RouterLink :to="{ name: 'my-restaurants' }"
					class="bg-accent hover:bg-accent/80 flex flex-col items-center justify-center rounded-lg p-2 transition-colors">
			<Store class="text-muted-foreground h-10 w-10" />
			<span class="text-foreground mt-2 text-sm text-center">My Restaurants</span>
		</RouterLink>
		<RouterLink :to="{ name: 'my-websites' }"
					class="bg-accent hover:bg-accent/80 flex flex-col items-center justify-center rounded-lg p-2 transition-colors">
			<Globe class="text-muted-foreground h-10 w-10" />
			<span class="text-foreground mt-2 text-sm text-center">My Websites</span>
		</RouterLink>
		<!-- <RouterLink
			:to="{ name: 'website' }"
			class="bg-accent hover:bg-accent/80 flex flex-col items-center justify-center rounded-lg p-2 transition-colors"
		>
			<Globe class="text-muted-foreground h-10 w-10" />
			<span class="text-foreground mt-2 text-sm">Website</span>
		</RouterLink> -->
		<!-- <button v-for="app in apps"
				:key="app.name"
				class="bg-accent hover:bg-accent/80 flex flex-col items-center justify-center rounded-lg p-2 transition-colors">
			<component :is="app.icon"
					   class="text-muted-foreground h-10 w-10" />
			<span class="text-foreground mt-2 text-sm">{{ app.name }}</span>
		</button> -->
	</div>
</template>
