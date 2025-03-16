<script setup lang="ts">
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { ref } from "vue";
import {
	FormField,
	FormItem,
	FormControl,
	FormLabel,
	// FormDescription,
	FormMessage
} from "@/components/ui/form";
import SPhoneInput from "./SPhoneInput.vue";
import { Button } from "@/components/ui/button";

// const phoneNumber = ref("+18574445555");
const phoneNumber = ref("");
const formSchema = toTypedSchema(
	z.object({
		phone: z.object({
			countryCode: z.string(),
			isValid: z.boolean().refine((val) => val === true, "Please enter a valid phone number"),
			isPossible: z.boolean(),
			countryCallingCode: z.string(),
			nationalNumber: z.string(),
			formatInternational: z.string(),
			formatNational: z.string(),
			uri: z.string(),
			e164: z.string(),
			rfc3966: z.string()
		})
	})
);

const form = useForm({
	validationSchema: formSchema
});

const onSubmit = form.handleSubmit((values) => {
	console.log(values);
	toast.message("You submitted the following values:", {
		description: `${JSON.stringify(values.phone, null, 3)}`
	});
});
</script>

<template>
	<section class="z-10 flex w-full max-w-5xl flex-col items-center gap-5 text-center">
		<div id="try"
			 class="w-full py-8">
			<div class="relative my-4 flex w-full flex-col justify-center space-y-2">
				<div
					 class="preview relative mt-2 flex min-h-[350px] w-full items-center justify-center rounded-md border p-10">
					<form @submit="onSubmit"
						  class="flex flex-col items-start justify-center space-y-8">
						<FormField v-slot="{ handleChange, handleBlur }"
								   name="phone">
							<FormItem class="flex flex-col items-start">
								<FormLabel class="text-left">Phone Number</FormLabel>
								<FormControl class="w-full">
									<SPhoneInput v-model="phoneNumber"
												 @update="handleChange"
												 @blur="handleBlur" />
								</FormControl>
								<!-- <FormDescription class="text-left"> Enter a phone number </FormDescription> -->
								<FormMessage />
							</FormItem>
						</FormField>
						<Button type="submit"> Submit </Button>
					</form>
				</div>
			</div>
		</div>
	</section>
</template>
