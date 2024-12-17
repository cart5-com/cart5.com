<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { AutoForm } from "@/components/ui/auto-form";
import { useFormPersistence } from "@/ui-plus/form/useFormPersistence";
import { useFormError } from "@/ui-plus/form/useFormError";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { object as z_object, string as z_string, type infer as z_infer } from "zod";
import { LOCAL_STORAGE_KEYS } from "src/const";
import { ref } from "vue";
import { authApiClient } from "@root/lib/authApiClient";
import { showTurnstile } from "@/ui-plus/dialog/showTurnstile";
import { useDialog } from "@/ui-plus/dialog/use-dialog";
import { Loader2 } from "lucide-vue-next";
import SignupVerifyForm from "@root/components/vue-forms/signup/SignupVerifyForm.vue";

const dialog = useDialog();

const schema = z_object({
	name: z_string().min(1).max(255),
	email: z_string().email(),
	password: z_string().min(8).max(255)
});

const form = useForm({
	validationSchema: toTypedSchema(schema)
});
const isLoading = ref(false);

useFormPersistence(form, {
	fields: {
		email: LOCAL_STORAGE_KEYS.REMEMBER_LAST_EMAIL,
		name: LOCAL_STORAGE_KEYS.REMEMBER_LAST_NAME
	}
});

const { globalError, handleError, clearError } = useFormError();

async function onSubmit(values: Record<string, any>) {
	isLoading.value = true;
	clearError()
	const { data, error } = await (await authApiClient.api.email_password.register.$post({
		form: {
			email: values.email,
			password: values.password,
			name: values.name,
			turnstile: await showTurnstile(import.meta.env.PUBLIC_TURNSTILE_SITE_KEY)
		},
	})).json()
	if (error) {
		handleError(error, form)
	} else {
		dialog.show<{ verifyEmail: string, code: string }>({
			title: "Please verify your email",
			closeable: false,
			component: SignupVerifyForm,
			props: {
				verifyEmail: values.email,
			},
			onSuccess: async (result) => { }
		});
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
				name: {
					inputProps: {
						autocomplete: 'name'
					}
				},
				email: {
					inputProps: {
						autocomplete: 'email'
					}
				},
				password: {
					inputProps: {
						type: 'password',
						autocomplete: 'new-password',
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
				Register
			</Button>
		</div>
	</AutoForm>
</template>
