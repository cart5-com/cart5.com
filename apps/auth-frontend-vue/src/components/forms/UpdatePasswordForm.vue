<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { AutoForm } from '@/ui-plus/auto-form'
import { toast } from '@/ui-plus/sonner'
import { useFormPlus } from "@/ui-plus/form/useFormPlus";
import { toTypedSchema } from "@vee-validate/zod";
import { apiClient } from "@api-client/index";
import { useForm } from "vee-validate";
import { z } from "zod";
import { Loader2 } from 'lucide-vue-next';
import { showTurnstile } from '@/ui-plus/dialog/showTurnstile';
import { refreshUserData, userStore } from '@auth-frontend-vue/stores/userStore';
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const emit = defineEmits<{
    close: [values: z.infer<typeof schema>],
    cancel: [];
    onError: [error: any];
}>();

const schema = z.object({
    email: z.string(),
    password: z.string()
        .min(8, { message: "min 8, use only StroNg_P@ssw0rd" })
        .max(255, { message: "max 255" }),
    confirm: z.string(),
}).refine(data => data.password === data.confirm, {
    message: t('passwordsMustMatch'),
    path: ['confirm'],
})

const form = useForm({
    validationSchema: toTypedSchema(schema)
});
const { isLoading, globalError, handleError, withSubmit } = useFormPlus(form);
form.setFieldValue("email", userStore.value?.email || "");

async function onSubmit(values: z.infer<typeof schema>) {
    await withSubmit(async () => {
        const { error } = await (await apiClient.auth.user['update-password'].$post({
            form: {
                password: values.password,
                turnstile: await showTurnstile(import.meta.env.VITE_PUBLIC_TURNSTILE_SITE_KEY)
            },
        })).json()
        if (error) {
            handleError(error, form);
            if (error.code === "FRESH_SESSION_REQUIRED") {
                refreshUserData();
                toast.error(t('freshSessionRequired'), {
                    description: t('pleaseLogoutAndLoginAgain')
                });
            }
        } else {
            toast.success(t('passwordUpdated'));
            emit("cancel");
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
                email: {
                    label: t('yourEmail'),
                    inputProps: {
                        disabled: true,
                        autocomplete: 'email',
                    },
                },
                password: {
                    label: t('newPassword'),
                    inputProps: {
                        type: 'password',
                        autofocus: true,
                        autocomplete: 'new-password',
                    },
                },
                confirm: {
                    label: t('confirmPassword'),
                    inputProps: {
                        type: 'password',
                        autocomplete: 'new-password',
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
                {{ t('update') }}
            </Button>
        </div>
    </AutoForm>

    <Button variant="secondary"
            @click="emit('cancel')"> {{ t('cancel') }} </Button>
</template>
