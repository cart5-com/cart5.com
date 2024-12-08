<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from "@/components/ui/card";
import { AutoForm } from "@/components/ui/auto-form";
import { useFormPersistence } from "@/ui-plus/form/useFormPersistence";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import * as z from "zod";
import { LOCAL_STORAGE_KEYS } from "src/const";
import CancelGoBackButton from "./CancelGoBackButton.vue";
import GoogleButton from "./GoogleButton.vue";
import { Separator } from "@/components/ui/separator";
import { ref } from "vue";
import { authApiClient } from "src/components/authApiClient";
import { showTurnstile } from "@/ui-plus/dialog/showTurnstile";

const schema = z.object({
	email: z.string().email(),
	password: z.string().min(8).max(255)
});

const form = useForm({
	validationSchema: toTypedSchema(schema)
});

useFormPersistence(form, {
	fields: {
		email: LOCAL_STORAGE_KEYS.REMEMBER_LAST_EMAIL
	}
});

const isLoading = ref(false);
const globalError = ref<string | null>(null);

async function onSubmit(values: Record<string, any>) {
	isLoading.value = true;
	globalError.value = null;
	const { data, error } = await (await authApiClient.api.email_password.login.$post({
		form: {
			email: values.email,
			password: values.password,
			turnstile: await showTurnstile(import.meta.env.PUBLIC_TURNSTILE_SITE_KEY)
		},
	})).json()
	if (error) {
		console.error(error);
		globalError.value = error.message ?? "Unknown error";
		error.issues?.forEach((issue) => {
			form.setFieldError(issue.path[0] as (keyof z.infer<typeof schema>), issue.message);
		});
	} else {
		// Success
		window.location.reload();
	}
	isLoading.value = false;
}
</script>

<template>
	<Card>
		<CardHeader>
			<CardTitle>Login</CardTitle>
			<CardDescription></CardDescription>
		</CardHeader>
		<CardContent class="">
			<AutoForm class="space-y-6"
					  :schema="schema"
					  :form="form"
					  @submit="onSubmit"
					  :field-config="{
						email: {
							inputProps: {
								autocomplete: 'email'
							}
						},
						password: {
							inputProps: {
								type: 'password',
								autocomplete: 'current-password'
							}
						}
					}">
				<div class="text-sm font-medium text-destructive"
					 v-if="globalError">
					{{ globalError }}
				</div>
				<Button type="submit"
						class="w-full"> Login </Button>
				<Separator class="my-4"
						   label="Or" />
				<GoogleButton />
				<Separator class="my-4" />
				<CancelGoBackButton />
			</AutoForm>
		</CardContent>
	</Card>
</template>
