<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { AutoForm } from "@/ui-plus/auto-form";
import { useFormPlus } from "@/ui-plus/form/useFormPlus";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { z } from "zod";
import { LOCAL_STORAGE_KEYS } from "@src/const";
import { apiClient } from "@api-client/index";
import { showTurnstile } from "@/ui-plus/dialog/showTurnstile";
import { useDialog } from "@/ui-plus/dialog/use-dialog";
import { Loader2 } from "lucide-vue-next";
import SignupVerifyForm from "@src/components/forms/auth-forms/signup/SignupVerifyForm.vue";

const dialog = useDialog();

const schema = z.object({
	name: z.string().min(1, { message: "min 1" }).max(255, { message: "max 255" }),
	email: z.string().email(),
	password: z.string().min(8, { message: "min 8, use only StroNg_P@ssw0rd" }).max(255, { message: "max 255" })
});

const form = useForm({
	validationSchema: toTypedSchema(schema)
});

const { isLoading, globalError, handleError, withSubmit } = useFormPlus(form, {
	persistenceFields: {
		email: LOCAL_STORAGE_KEYS.REMEMBER_LAST_EMAIL,
		name: LOCAL_STORAGE_KEYS.REMEMBER_LAST_NAME
	}
});

async function onSubmit(values: z.infer<typeof schema>) {
	await withSubmit(async () => {
		const { data, error } = await (await apiClient.auth.email_password.register.$post({
			form: {
				email: values.email,
				password: values.password,
				name: values.name,
				turnstile: await showTurnstile(import.meta.env.VITE_PUBLIC_TURNSTILE_SITE_KEY)
			},
		})).json()
		if (error) {
			handleError(error, form)
		} else {
			console.log(data);
			dialog.show<{ verifyEmail: string, code: string }>({
				title: "Please verify your email",
				closeable: false,
				component: SignupVerifyForm,
				props: {
					verifyEmail: values.email,
				},
				onSuccess: async (_result) => { }
			});
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
				Sign up
			</Button>
		</div>
	</AutoForm>
</template>
