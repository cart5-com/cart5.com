<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { AutoForm } from "@/components/ui/auto-form";
import { useFormPersistence } from "@/ui-plus/form/useFormPersistence";
import { showTurnstile } from "@/ui-plus/dialog/showTurnstile";
import { useDialog } from "@/ui-plus/dialog/use-dialog";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { object as z_object, string as z_string, type infer as z_infer } from "zod";
import { LOCAL_STORAGE_KEYS } from "@root/const";
import { authApiClient } from "@root/lib/authApiClient";
import OTPVerifyForm from "./OTPVerifyForm.vue";
import { ref } from "vue";
import { Loader2 } from "lucide-vue-next";
import { useFormError } from "@/ui-plus/form/useFormError";
const dialog = useDialog();

const schema = z_object({
	email: z_string().email(),
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
const { globalError, handleError, clearError } = useFormError();

async function onSubmit(values: z_infer<typeof schema>) {
	isLoading.value = true;
	clearError();
	const { data, error } = await (await authApiClient.api.otp.send.$post({
		form: {
			verifyEmail: values.email,
			turnstile: await showTurnstile(import.meta.env.PUBLIC_TURNSTILE_SITE_KEY)
		},
	})).json()

	if (error) {
		handleError(error, form);
	} else {
		dialog.show<{ verifyEmail: string, code: string }>({
			title: "Please verify your email",
			closeable: false,
			component: OTPVerifyForm,
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
