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
import CancelGoBackButton from "../CancelGoBackButton.vue";
import GoogleButton from "../GoogleButton.vue";
import { Separator } from "@/components/ui/separator";
import { ref } from "vue";
import { authApiClient } from "../../authApiClient";
import { showTurnstile } from "@/ui-plus/dialog/showTurnstile";
import { useDialog } from "@/ui-plus/dialog/use-dialog";
import RegisterVerifyForm from "src/components/auth/register/RegisterVerifyForm.vue";
import { Loader2 } from "lucide-vue-next";

const dialog = useDialog();

const schema = z.object({
	name: z.string().min(1).max(255),
	email: z.string().email(),
	password: z.string().min(8).max(255)
});

const form = useForm({
	validationSchema: toTypedSchema(schema)
});
const isLoading = ref(false);
const globalError = ref<string | null>(null);

useFormPersistence(form, {
	fields: {
		email: LOCAL_STORAGE_KEYS.REMEMBER_LAST_EMAIL,
		name: LOCAL_STORAGE_KEYS.REMEMBER_LAST_NAME
	}
});

// setTimeout(() => {
// 	// form.setErrors({
// 	// 	password: "Password is too weak or has been compromised"
// 	// });
// }, 100);

async function onSubmit(values: Record<string, any>) {
	isLoading.value = true;
	globalError.value = null;
	const { data, error } = await (await authApiClient.api.email_password.register.$post({
		form: {
			email: values.email,
			password: values.password,
			name: values.name,
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
		dialog.show<{ verifyEmail: string, code: string }>({
			title: "Please verify your email",
			closeable: false,
			component: RegisterVerifyForm,
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
	<Card>
		<CardHeader>
			<CardTitle>Register</CardTitle>
			<CardDescription></CardDescription>
		</CardHeader>
		<CardContent class="">
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
								autocomplete: 'new-password'
							}
						}
					}">
				<div class="text-sm font-medium text-destructive"
					 v-if="globalError">
					{{ globalError }}
				</div>
				<Button type="submit"
						:disabled="isLoading"
						class="w-full">
					<Loader2 v-if="isLoading"
							 class="animate-spin" />
					Register
				</Button>
				<Separator class="my-4"
						   label="Or" />
				<GoogleButton />
				<Separator class="my-4" />
				<CancelGoBackButton />
			</AutoForm>
		</CardContent>
	</Card>
</template>
