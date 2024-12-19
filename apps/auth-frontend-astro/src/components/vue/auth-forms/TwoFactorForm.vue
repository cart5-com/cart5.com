<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { AutoForm } from "@/components/ui/auto-form";
import { showTurnstile } from "@/ui-plus/dialog/showTurnstile";
import { authApiClient } from "@root/lib/authApiClient";
import { object as z_object, string as z_string, type infer as z_infer } from "zod";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useFormPlus } from "@/ui-plus/form/useFormPlus";
import { removeUserFromSession } from "@root/stores/userStore";
import { Loader2 } from "lucide-vue-next";
import { toast } from "@/components/ui/sonner";

const emit = defineEmits<{
    close: [values: z_infer<typeof schema>],
    cancel: [];
    onError: [error: any];
}>();

const schema = z_object({
    userProvidedCode: z_string().min(6, { message: 'Please enter 6 characters' }).max(6, { message: 'Please enter exactly 6 characters' }),
})

const formSchema = toTypedSchema(schema)

const form = useForm({
    validationSchema: formSchema,
})

const { isLoading, globalError, handleError, withSubmit } = useFormPlus();

async function onSubmit(values: z_infer<typeof schema>) {
    await withSubmit(async () => {
        const { data, error } = await (await authApiClient.api["two-factor-auth"].verify.$post({
            form: {
                userProvidedCode: values.userProvidedCode,
                turnstile: await showTurnstile(import.meta.env.PUBLIC_TURNSTILE_SITE_KEY)
            },
        })).json()
        if (error) {
            handleError(error, form);
        } else {
            // Success
            removeUserFromSession();
            window.location.reload();
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
        const { data, error } = await (await authApiClient.api["two-factor-auth"]['remove-2fa-with-recovery-code'].$post({
            form: {
                recoveryCode,
                turnstile: await showTurnstile(import.meta.env.PUBLIC_TURNSTILE_SITE_KEY)
            },
        })).json()
        if (error) {
            toast.error(error.message ?? 'An error occurred');
        } else {
            // Success
            removeUserFromSession();
            window.location.reload();
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
                    label: 'OTP Code',
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