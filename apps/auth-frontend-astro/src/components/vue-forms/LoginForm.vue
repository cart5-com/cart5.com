<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { AutoForm } from "@/components/ui/auto-form";
import { useFormPersistence } from "@/ui-plus/form/useFormPersistence";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { object as z_object, string as z_string, type infer as z_infer } from "zod";
import { LOCAL_STORAGE_KEYS } from "@root/const";
import { ref } from "vue";
import { authApiClient } from "@root/lib/authApiClient";
import { showTurnstile } from "@/ui-plus/dialog/showTurnstile";
import { removeUserFromSession } from "@root/stores/userStore";
import { useFormError } from "@/ui-plus/form/useFormError";
import { Loader2 } from "lucide-vue-next";

const schema = z_object({
	email: z_string().email(),
	password: z_string().min(8).max(255)
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
const { handleError, clearError } = useFormError();

async function onSubmit(values: Record<string, any>) {
	isLoading.value = true;
	clearError();
	const { data, error } = await (await authApiClient.api.email_password.login.$post({
		form: {
			email: values.email,
			password: values.password,
			turnstile: await showTurnstile(import.meta.env.PUBLIC_TURNSTILE_SITE_KEY)
		},
	})).json()
	if (error) {
		handleError(error, form);
	} else {
		// Success
		removeUserFromSession();
		window.location.reload();
	}
	isLoading.value = false;
}
</script>

<template>
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
		<div>
			<Button type="submit"
					:disabled="isLoading"
					class="w-full my-6">
				<Loader2 v-if="isLoading"
						 class="animate-spin" />
				Log in
			</Button>
		</div>
	</AutoForm>
</template>
