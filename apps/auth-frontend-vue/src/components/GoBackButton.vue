<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-vue-next";
import { getNextUrl, getNextHostname } from "@auth-frontend-vue/lib/queryHelpers";
import { onMounted, ref } from 'vue';
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const buttonText = ref(t('goBackTo'));

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
		buttonText.value = t('goBackTo', { hostname: nextHostname });
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
