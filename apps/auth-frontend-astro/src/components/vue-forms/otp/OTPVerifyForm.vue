<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { object as z_object, string as z_string, type infer as z_infer } from "zod";
import { authApiClient } from "@root/lib/authApiClient";
import { showTurnstile } from '@/ui-plus/dialog/showTurnstile'
import { useFormPlus } from '@/ui-plus/form/useFormPlus'
import { Loader2 } from 'lucide-vue-next'
import { removeUserFromSession } from '@root/stores/userStore'


const props = defineProps<{
    verifyEmail: string
}>();

const emit = defineEmits<{
    close: [values: z_infer<typeof schema>],
    cancel: [];
}>();

const schema = z_object({
    verifyEmail: z_string().email(),
    code: z_string().min(6, { message: 'Please enter 6 characters' }).max(6, { message: 'Please enter exactly 6 characters' }),
})

const formSchema = toTypedSchema(schema)

const form = useForm({
    validationSchema: formSchema,
})

const { isLoading, globalError, handleError, withSubmit } = useFormPlus();

form.setFieldValue("verifyEmail", props.verifyEmail);
const onSubmit = form.handleSubmit(async (values) => {
    await withSubmit(async () => {
        const { error } = await (await authApiClient.api.otp.verify.$post({
            form: {
                verifyEmail: values.verifyEmail,
                code: values.code,
                turnstile: await showTurnstile(import.meta.env.PUBLIC_TURNSTILE_SITE_KEY)
            },
        })).json()
        if (error) {
            handleError(error, form);
        } else {
            removeUserFromSession();
            window.location.reload();
        }
    })
})
</script>

<template>
    <form class="space-y-6"
          @submit="onSubmit">
        <FormField v-slot="{ componentField }"
                   name="verifyEmail">
            <FormItem>
                <FormControl>
                    <Input type="text"
                           disabled
                           v-bind="componentField" />
                </FormControl>
                <FormMessage />
            </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }"
                   name="code">
            <FormItem>
                <FormLabel>One-time password</FormLabel>
                <FormControl>
                    <Input type="text"
                           autofocus
                           v-bind="componentField" />
                </FormControl>
                <FormMessage />
            </FormItem>
        </FormField>
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
                Verify
            </Button>
        </div>
    </form>
    <Button variant="outline"
            @click="emit('cancel')"> Cancel </Button>
</template>