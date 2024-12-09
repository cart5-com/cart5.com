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
import * as z from 'zod'
import { useDialog } from '@/ui-plus/dialog/use-dialog';
import { authApiClient } from '../../authApiClient'
import { showTurnstile } from '@/ui-plus/dialog/showTurnstile'

const dialog = useDialog();

const props = defineProps<{
    verifyEmail: string
}>();

const emit = defineEmits<{
    close: [values: z.infer<typeof schema>],
    cancel: [];
}>();

const schema = z.object({
    verifyEmail: z.string().email(),
    code: z.string().min(6, { message: 'Please enter 6 characters' }).max(6, { message: 'Please enter exactly 6 characters' }),
})

const formSchema = toTypedSchema(schema)

const form = useForm({
    validationSchema: formSchema,
})

form.setFieldValue("verifyEmail", props.verifyEmail);
const onSubmit = form.handleSubmit(async (values) => {
    const loadingId = dialog.showBlockingLoadingModal();
    const { error } = await (await authApiClient.api.otp.verify.$post({
        form: {
            verifyEmail: values.verifyEmail,
            code: values.code,
            turnstile: await showTurnstile(import.meta.env.PUBLIC_TURNSTILE_SITE_KEY)
        },
    })).json()
    if (error) {
        console.error(error);
        form.setFieldError("code", error.message ?? "Unknown error");
        error.issues?.forEach((issue) => {
            form.setFieldError(issue.path[0] as (keyof z.infer<typeof schema>), issue.message);
        });
    } else {
        window.location.reload();
    }
    dialog.cancel(loadingId)
    // emit('close', values);
    // emit('cancel')
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
        <div>
            <Button type="submit"
                    class="mt-10 w-full">
                Submit
            </Button>
        </div>
    </form>
    <Button variant="outline"
            @click="emit('cancel')"> Cancel </Button>
</template>