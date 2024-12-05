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

const schema = z.object({
	name: z.string().min(1).max(255),
	email: z.string().email(),
	password: z.string().min(8).max(255)
});

const form = useForm({
	validationSchema: toTypedSchema(schema)
});

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

function onSubmit(values: Record<string, any>) {
	console.log(JSON.stringify(values, null, 2));
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
				<div>
					<Button type="submit"
							class="mt-10 w-full"> Register </Button>
				</div>
			</AutoForm>
		</CardContent>
	</Card>
</template>
