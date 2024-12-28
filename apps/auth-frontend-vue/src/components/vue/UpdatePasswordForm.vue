<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { AutoForm } from '@/ui-plus/auto-form'
import { toast } from '@/ui-plus/sonner'
import { useFormPlus } from "@/ui-plus/form/useFormPlus";
import { toTypedSchema } from "@vee-validate/zod";
import { getAuthApiClient } from "@src/lib/authApiClient";
import { useForm } from "vee-validate";
import { object as z_object, string as z_string, type infer as z_infer } from "zod";
import { Loader2 } from 'lucide-vue-next';
import { showTurnstile } from '@/ui-plus/dialog/showTurnstile';
import { $userStore, refreshUserData } from '@src/stores/userStore';

const emit = defineEmits<{
    close: [values: z_infer<typeof schema>],
    cancel: [];
    onError: [error: any];
}>();

const schema = z_object({
    email: z_string(),
    password: z_string()
        .min(8, { message: "min 8, use only StroNg_P@ssw0rd" })
        .max(255, { message: "max 255" }),
    confirm: z_string(),
}).refine(data => data.password === data.confirm, {
    message: 'Passwords must match.',
    path: ['confirm'],
})

const form = useForm({
    validationSchema: toTypedSchema(schema)
});
const { isLoading, globalError, handleError, withSubmit } = useFormPlus();
form.setFieldValue("email", $userStore.get()?.email || "");

async function onSubmit(values: z_infer<typeof schema>) {
    await withSubmit(async () => {
        const { error } = await (await getAuthApiClient().api.user['update-password'].$post({
            form: {
                password: values.password,
                turnstile: await showTurnstile(import.meta.env.PUBLIC_TURNSTILE_SITE_KEY)
            },
        })).json()
        if (error) {
            handleError(error, form);
            if (error.code === "FRESH_SESSION_REQUIRED") {
                refreshUserData();
                toast.error("Fresh session required", {
                    description: "Please logout and login again"
                });
            }
        } else {
            toast.success("Password updated");
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
                    label: 'Your email',
                    inputProps: {
                        disabled: true,
                    },
                },
                password: {
                    label: 'New password',
                    inputProps: {
                        type: 'password',
                        autofocus: true,
                        autocomplete: 'new-password',
                    },
                },
                confirm: {
                    label: 'Confirm password',
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
                Update
            </Button>
        </div>
    </AutoForm>

    <Button variant="secondary"
            @click="emit('cancel')"> Cancel </Button>
</template>