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
	email: z.string().email(),
	password: z.string().min(8).max(255)
});

const form = useForm({
	validationSchema: toTypedSchema(schema)
});

useFormPersistence(form, {
	fields: {
		email: LOCAL_STORAGE_KEYS.REMEMBER_LAST_EMAIL
	}
});

function onSubmit(values: Record<string, any>) {
	console.log(JSON.stringify(values, null, 2));
}
</script>

<template>
	<Card>
		<CardHeader>
			<CardTitle>Login</CardTitle>
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
							class="mt-10 w-full"> Login </Button>
				</div>
			</AutoForm>
		</CardContent>
	</Card>
</template>
