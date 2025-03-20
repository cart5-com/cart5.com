<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { AutoForm } from "@/ui-plus/auto-form";
import { showTurnstile } from "@/ui-plus/dialog/showTurnstile";
import { useDialog } from "@/ui-plus/dialog/use-dialog";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { z } from "zod";
import { LOCAL_STORAGE_KEYS } from "@auth-frontend-vue/const";
import { apiClient } from "@api-client/index";
import OTPVerifyForm from "./OTPVerifyForm.vue";
import { Loader2 } from "lucide-vue-next";
import { useFormPlus } from "@/ui-plus/form/useFormPlus";
import TwoFactorForm from "@auth-frontend-vue/components/forms/auth-forms/TwoFactorForm.vue";
const dialog = useDialog();

const schema = z.object({
	email: z.string().email(),
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
		const { data, error } = await (await apiClient.auth.otp.send.$post({
			form: {
				verifyEmail: values.email,
				turnstile: await showTurnstile(import.meta.env.VITE_PUBLIC_TURNSTILE_SITE_KEY)
			},
		})).json()
		if (error) {
			handleError(error, form);
		} else {
			console.log(data);
			dialog.show<{ verifyEmail: string, code: string }>({
				title: "Please verify your email",
				closeable: false,
				component: OTPVerifyForm,
				props: {
					verifyEmail: values.email,
				},
				onSuccess: async () => { },
				onError: async (error: any) => {
					if (error.code === 'TWO_FACTOR_AUTH_REQUIRED') {
						dialog.show({
							title: "Use your two factor authentication code",
							closeable: false,
							component: TwoFactorForm,
						});
					}
				}
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
				email: {
					inputProps: {
						autocomplete: 'email',
					}
				},
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
				Send Code
			</Button>
		</div>
	</AutoForm>
</template>
