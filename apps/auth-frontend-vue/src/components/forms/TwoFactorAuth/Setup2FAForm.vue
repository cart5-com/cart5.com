<script setup lang="ts">
import { AutoForm } from '@/ui-plus/auto-form'
import { z } from "zod";
import { apiClient } from '@api-client/index';
import { onMounted, ref } from 'vue';
import Button from '@/components/ui/button/Button.vue';
import Separator from '@/ui-plus/separator/Separator.vue';
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from '@/ui-plus/sonner';
import { useFormPlus } from "@/ui-plus/form/useFormPlus";
import { Loader2 } from 'lucide-vue-next';
import { showTurnstile } from '@/ui-plus/dialog/showTurnstile';
import Setup2FaWithKey from './Setup2FaWithKey.vue';
const props = defineProps<{
    name: string
    encodedTOTPKey: string
    totpKey: string
    qrCodeSVG: string
}>();

const name = ref(props.name);
const totpKey = ref(props.totpKey);
const qrCodeContainer = ref<HTMLElement | null>(null);

onMounted(async () => {
    if (qrCodeContainer.value) {
        qrCodeContainer.value.innerHTML = props.qrCodeSVG;
    }
});


const emit = defineEmits<{
    close: [values: { recoveryCode: string }],
    cancel: [];
    onError: [error: any];
}>();

const schema = z.object({
    userProvidedCode: z.string().length(6, { message: "TOTP code must be 6 digits" }),
})

const formSchema = toTypedSchema(schema)

const form = useForm({
    validationSchema: formSchema,
})

const { isLoading, globalError, handleError, withSubmit } = useFormPlus(form);

async function onSubmit(values: z.infer<typeof schema>) {
    await withSubmit(async () => {
        const { data, error } = await (await apiClient.auth.two_factor_auth.save.$post({
            form: {
                ...values,
                encodedTOTPKey: props.encodedTOTPKey,
                turnstile: await showTurnstile(import.meta.env.VITE_PUBLIC_TURNSTILE_SITE_KEY)
            },
        })).json()
        if (error) {
            handleError(error, form);
            if (error.code === "FRESH_SESSION_REQUIRED") {
                toast.error("Fresh session required", {
                    description: "Please logout and login again"
                });
            }
        } else {
            emit('close', data);
        }
    })
}
</script>

<template>
    <Separator class="my-10"
               label="Scan a QR code" />


    <div id="qrcode-container"
         ref="qrCodeContainer"
         class="max-w-xs my-4"></div>


    <Setup2FaWithKey :name="name"
                     :totpKey="totpKey" />

    <AutoForm class="space-y-6"
              :schema="schema"
              :form="form"
              @submit="onSubmit"
              :field-config="{
                userProvidedCode: {
                    label: '2FA code',
                    description: 'Enter generated 6 digit code from your authenticator app',
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
            @click="$emit('cancel')"> Cancel </Button>
</template>
