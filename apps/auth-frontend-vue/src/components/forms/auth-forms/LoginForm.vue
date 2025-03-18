<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { AutoForm } from "@/ui-plus/auto-form";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { z } from "zod";
import { LOCAL_STORAGE_KEYS } from "@src/const";
import { apiClient } from "@api-client/index";
import { showTurnstile } from "@/ui-plus/dialog/showTurnstile";
import { useFormPlus } from "@/ui-plus/form/useFormPlus";
import { Loader2 } from "lucide-vue-next";
import TwoFactorForm from "@src/components/forms/auth-forms/TwoFactorForm.vue";
import { useDialog } from "@/ui-plus/dialog/use-dialog";
import { refreshUserData } from "@src/stores/userStore";
const dialog = useDialog();

const schema = z.object({
	email: z.string().email(),
	password: z.string().min(8).max(255)
});
const form = useForm({
	validationSchema: toTypedSchema(schema)
});
const { isLoading, globalError, handleError, withSubmit } = useFormPlus(form, {
	persistenceFields: {
		email: LOCAL_STORAGE_KEYS.REMEMBER_LAST_EMAIL
	}
});
async function onSubmit(values: z.infer<typeof schema>) {
	await withSubmit(async () => {
		const { data, error } = await (await apiClient.auth.email_password.login.$post({
			form: {
				email: values.email,
				password: values.password,
				turnstile: await showTurnstile(import.meta.env.VITE_PUBLIC_TURNSTILE_SITE_KEY)
			},
		})).json()
		if (error) {
			if (error.code === 'TWO_FACTOR_AUTH_REQUIRED') {
				dialog.show({
					title: "Use your two factor authentication code",
					closeable: false,
					component: TwoFactorForm,
				});
			} else {
				handleError(error, form);
			}
		} else {
			// Success
			console.log(data);
			await refreshUserData();
		}
	})
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
		<div class="text-sm font-medium text-destructive"
			 v-if="globalError">
			{{ globalError }}
		</div>
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
