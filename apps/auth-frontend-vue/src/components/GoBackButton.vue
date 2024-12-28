<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-vue-next";
import { getNextUrl, getNextHostname } from "@src/lib/queryHelpers";
import { onMounted, ref } from 'vue';

const buttonText = ref('Go back');

function handleClick() {
	const nextUrl = getNextUrl();
	if (nextUrl) {
		window.location.href = nextUrl;
	} else {
		window.history.back();
	}
}

onMounted(() => {
	const nextHostname = getNextHostname();
	if (nextHostname) {
		buttonText.value = `Go back to ${nextHostname}`;
	}
});
</script>

<template>
	<Button class="go-back-button mt-4"
			@click="handleClick">
		<ArrowLeftIcon />
		<span v-html="buttonText"></span>
	</Button>
</template>
