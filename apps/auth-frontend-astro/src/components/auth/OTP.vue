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
import { authApiClient } from "../authApiClient";
import OTPVerifyForm from "src/components/auth/OTPVerifyForm.vue";
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

async function onSubmit(values: z.infer<typeof schema>) {
	const { data, error } = await (await authApiClient.api.otp.otp.$post({
		form: {
			verifyEmail: values.email,
			turnstile: await showTurnstile(import.meta.env.PUBLIC_TURNSTILE_SITE_KEY)
		},
	})).json()

	if (error) {
		console.error(error);
		alert("Error sending OTP");
	} else {
		dialog.show<{ verifyEmail: string, code: string }>({
			title: "Please verify your email",
			closeable: false,
			component: OTPVerifyForm,
			props: {
				verifyEmail: values.email,
			},
			onSuccess: async (result) => {
				const loadingId = dialog.showBlockingLoadingModal();
				const { error } = await (await authApiClient.api.otp.verify.$post({
					form: {
						verifyEmail: result.verifyEmail,
						code: result.code,
						turnstile: await showTurnstile(import.meta.env.PUBLIC_TURNSTILE_SITE_KEY)
					},
				})).json()
				if (error) {
					console.error(error);
					alert("Error verifying OTP");
				} else {
					window.location.reload();
				}
				dialog.cancel(loadingId)
			}
		});
	}
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
				<div>
					<Button type="submit"
							class="mt-10 w-full"> Send Code </Button>
				</div>
			</AutoForm>
		</CardContent>
	</Card>
</template>
