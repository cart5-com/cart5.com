<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { AutoForm } from '@/ui-plus/auto-form'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from "zod";
import { useFormPlus } from '@/ui-plus/form/useFormPlus'
import { Loader2 } from 'lucide-vue-next'
import { authGlobalApiClient } from '@api-client/auth_global';
import { showTurnstilePopup } from '@lib/clientUtils/showTurnstilePopup';
import AutoFormFieldPhone from '@/ui-plus/PhoneNumber/AutoFormFieldPhone.vue';
import { onMounted, ref } from 'vue';
import { toast } from '@/ui-plus/sonner';
import PhoneValidationCodeForm from './PhoneValidationCodeForm.vue';

const REMEMBER_LAST_PHONE_NUMBER = "REMEMBER_LAST_PHONE_NUMBER_INPUT_VALUE"
const props = defineProps<{
    pageUrl: string;
}>();

const schema = z.object({
    phoneNumber: z.string().min(1, { message: "please enter a valid phone number" }),
})

const form = useForm({
    validationSchema: toTypedSchema(schema),
})

const { isLoading, globalError, handleError, withSubmit } = useFormPlus(form, {
    persistenceFields: {
        phoneNumber: REMEMBER_LAST_PHONE_NUMBER
    }
});

async function onSendOtpSubmit(values: z.infer<typeof schema>) {
    await withSubmit(async () => {
        console.log('values', values);
        let turnstile;
        try {
            turnstile = await showTurnstilePopup(
                props.pageUrl
            );
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            toast.error(errorMessage);
            return;
        }
        const { error } = await (await authGlobalApiClient.phone.send_otp.$post({
            form: {
                phoneNumber: values.phoneNumber,
                turnstile: turnstile
            },
        })).json()
        if (error) {
            handleError(error, form);
        } else {
            isSendOtpFormVisible.value = false;
            setTimeout(() => {
                const pinInput = document.querySelector<HTMLInputElement>('[placeholder="○"]');
                if (pinInput) {
                    pinInput.focus();
                }
            }, 500);
        }
    })
}

const isSendOtpFormVisible = ref(true);
onMounted(() => {
    setTimeout(() => {
        console.log('focusing phone number input');
        const phoneNumberInput = document.querySelector<HTMLInputElement>('[name="phoneNumber"]');
        if (phoneNumberInput) {
            console.log('focusing phone number input222', phoneNumberInput);
            phoneNumberInput.focus();
        }
    }, 500);
})
</script>

<template>
    <div class="py-10">
        <AutoForm v-if="isSendOtpFormVisible"
                  class="space-y-6"
                  :schema="schema"
                  :form="form"
                  :field-config="{
                    phoneNumber: {
                        label: 'Your Phone Number',
                        component: AutoFormFieldPhone,
                        inputProps: {
                            autofocus: true,
                        },
                    },
                }"
                  @submit="onSendOtpSubmit">
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
                    Verify Phone Number
                </Button>
            </div>
        </AutoForm>
        <PhoneValidationCodeForm v-else
                                 :page-url="pageUrl"
                                 @success="$emit('close', $event)" />
    </div>
</template>
