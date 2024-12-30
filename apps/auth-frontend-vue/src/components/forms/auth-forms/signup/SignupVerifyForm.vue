<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { AutoForm } from '@/ui-plus/auto-form'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { object as z_object, string as z_string, type infer as z_infer } from "zod";
import { getAuthApiClient } from "@src/lib/authApiClient";
import { showTurnstile } from '@/ui-plus/dialog/showTurnstile'
import { useFormPlus } from '@/ui-plus/form/useFormPlus'
import { Loader2 } from 'lucide-vue-next'
import { refreshUserAndRedirectToSavedPath } from '@src/lib/refreshUserAndRedirectToSavedPath';

const props = defineProps<{
    verifyEmail: string
}>();

const emit = defineEmits<{
    close: [values: z_infer<typeof schema>],
    cancel: [];
    onError: [error: any];
}>();

const schema = z_object({
    verifyEmail: z_string().email(),
    code: z_string()
        .min(6, { message: '6 characters' })
        .max(6, { message: '6 characters' }),
})

const formSchema = toTypedSchema(schema)

const form = useForm({
    validationSchema: formSchema,
});

const { isLoading, globalError, handleError, withSubmit } = useFormPlus();

form.setFieldValue("verifyEmail", props.verifyEmail);
async function onSubmit(values: z_infer<typeof schema>) {
    await withSubmit(async () => {
        const { data, error } = await (await getAuthApiClient().api.email_password.verify.$post({
            form: {
                verifyEmail: values.verifyEmail,
                code: values.code,
                turnstile: await showTurnstile(import.meta.env.PUBLIC_TURNSTILE_SITE_KEY)
            },
        })).json()
        if (error) {
            handleError(error, form);
        } else {
            // Success
            console.log(data);
            await refreshUserAndRedirectToSavedPath();
            emit('cancel');
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
                verifyEmail: {
                    label: 'Email',
                    inputProps: {
                        disabled: true,
                    },
                },
                code: {
                    label: 'One-time password',
                    description: 'Enter the code we sent to your email',
                    inputProps: {
                        autocomplete: 'one-time-code',
                        autofocus: true,
                    },
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
                Verify
            </Button>
        </div>
    </AutoForm>
    <Button variant="secondary"
            @click="emit('cancel')"> Cancel </Button>
</template>