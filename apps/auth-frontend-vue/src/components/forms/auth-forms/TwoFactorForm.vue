<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { AutoForm } from "@/ui-plus/auto-form";
import { showTurnstile } from "@/ui-plus/dialog/showTurnstile";
import { apiClient } from "@api-client/index";
import { z } from "zod";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useFormPlus } from "@/ui-plus/form/useFormPlus";
import { Loader2 } from "lucide-vue-next";
import { toast } from "@/ui-plus/sonner";
import { refreshUserData } from "@src/stores/userStore";

const emit = defineEmits<{
    close: [values: z.infer<typeof schema>],
    cancel: [];
    onError: [error: any];
}>();

const schema = z.object({
    userProvidedCode: z.string().min(6, { message: 'Please enter 6 characters' }).max(6, { message: 'Please enter exactly 6 characters' }),
})

const formSchema = toTypedSchema(schema)

const form = useForm({
    validationSchema: formSchema,
})

const { isLoading, globalError, handleError, withSubmit } = useFormPlus(form);

async function onSubmit(values: z.infer<typeof schema>) {
    await withSubmit(async () => {
        const { data, error } = await (await apiClient.auth.two_factor_auth.verify.$post({
            form: {
                userProvidedCode: values.userProvidedCode,
                turnstile: await showTurnstile(import.meta.env.VITE_PUBLIC_TURNSTILE_SITE_KEY)
            },
        })).json()
        if (error) {
            handleError(error, form);
        } else {
            // Success
            console.log(data);
            await refreshUserData();
            emit('cancel');
        }
    })
}

async function resetWithRecoveryCode() {
    const recoveryCode = prompt(
        'Enter your recovery code.\n\n' +
        'This is the code you saved when you first enabled 2FA. ' +
        'This action will disable 2FA on your account.'
    ) ?? '';
    if (!recoveryCode) {
        toast.error('Please enter a recovery code to reset 2FA');
        return;
    }
    await withSubmit(async () => {
        const { data, error } = await (await apiClient.auth.two_factor_auth['remove-2fa-with-recovery-code'].$post({
            form: {
                recoveryCode,
                turnstile: await showTurnstile(import.meta.env.VITE_PUBLIC_TURNSTILE_SITE_KEY)
            },
        })).json()
        if (error) {
            toast.error(error.message ?? 'An error occurred');
        } else {
            // Success
            console.log(data);
            await refreshUserData();
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
                userProvidedCode: {
                    label: 'Code',
                    inputProps: {
                        name: 'totp',
                        id: 'totp',
                        autocomplete: 'one-time-code'
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
                Verify
            </Button>
        </div>
    </AutoForm>
    <Button variant="link"
            class="text-secondary-foreground"
            @click="resetWithRecoveryCode">
        Reset 2FA
    </Button>
    <Button variant="secondary"
            @click="emit('cancel')"> Cancel </Button>
</template>