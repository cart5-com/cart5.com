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
import { showTurnstile } from "@/ui-plus/dialog/showTurnstile";
import { useDialog } from "@/ui-plus/dialog/use-dialog";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import * as z from "zod";
import { LOCAL_STORAGE_KEYS } from "src/const";
import { authApiClient } from "../../authApiClient";
import OTPVerifyForm from "./OTPVerifyForm.vue";
import CancelGoBackButton from "../CancelGoBackButton.vue";
import GoogleButton from "../GoogleButton.vue";
import { Separator } from "@/components/ui/separator";
import { ref } from "vue";
import { Loader2 } from "lucide-vue-next";
const dialog = useDialog();

const schema = z.object({
	email: z.string().email(),
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

async function onSubmit(values: z.infer<typeof schema>) {
	isLoading.value = true;
	globalError.value = null;
	const { data, error } = await (await authApiClient.api.otp.send.$post({
		form: {
			verifyEmail: values.email,
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
	<Card>
		<CardHeader>
			<CardTitle>One Time Password</CardTitle>
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
								autocomplete: 'email',
							}
						},
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
					Send Code
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
