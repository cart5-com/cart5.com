<script setup lang="ts">
import { ROUTES } from "@src/const";
import ButtonGroupContainer from "@/ui-plus/ButtonGroup/ButtonGroupContainer.vue";
import ButtonGroupButton from "@/ui-plus/ButtonGroup/ButtonGroupButton.vue";
import QueryLink from "@src/components/QueryLink.vue";
interface Props {
	activeRoute: string
}

defineProps<Props>()
</script>

<template>
	<ButtonGroupContainer>
		<QueryLink :to="ROUTES.LOGIN">
			<ButtonGroupButton :active="activeRoute === ROUTES.LOGIN">
				Log in
			</ButtonGroupButton>
		</QueryLink>
		<QueryLink :to="ROUTES.SIGNUP">
			<ButtonGroupButton :active="activeRoute === ROUTES.SIGNUP">
				Sign up
			</ButtonGroupButton>
		</QueryLink>
		<QueryLink :to="ROUTES.OTP">
			<ButtonGroupButton :active="activeRoute === ROUTES.OTP">
				OTP
			</ButtonGroupButton>
		</QueryLink>
	</ButtonGroupContainer>
</template>