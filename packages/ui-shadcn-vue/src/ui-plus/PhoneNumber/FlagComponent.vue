<script setup lang="ts">
import { defineProps } from "vue";

const props = defineProps<{
	country?: string
	countryName?: string
}>()

</script>

<template>
	<span class="bg-foreground/20 flex h-4 w-6 overflow-hidden rounded-sm">
		<img v-if="country"
			 :src="`https://flagcdn.com/w40/${props.country?.toLowerCase()}.png`"
			 :alt="countryName"
			 :title="countryName" />
	</span>
</template>
