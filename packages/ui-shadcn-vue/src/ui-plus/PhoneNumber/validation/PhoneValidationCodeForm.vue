<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { AutoForm } from "@/ui-plus/auto-form";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { z } from "zod";
import AutoFormFieldPin from "@/ui-plus/auto-form/AutoFormFieldPin.vue";
import { useFormPlus } from '@/ui-plus/form/useFormPlus'
import { Loader2 } from "lucide-vue-next";
import { authGlobalApiClient } from '@api-client/auth_global';
import { showTurnstilePopup } from '@lib/clientUtils/showTurnstilePopup';
import { toast } from '@/ui-plus/sonner';

const props = defineProps<{
    pageUrl: string;
}>();

const emit = defineEmits<{
    (e: 'success'): void
}>();

const schema = z.object({
    code: z.string().length(4, { message: 'invalid sms code' }),
})

const form = useForm({
    validationSchema: toTypedSchema(schema),
});

const { isLoading, globalError, handleError, withSubmit } = useFormPlus(form);

async function onFormSubmit(_values: z.infer<typeof schema>) {
    await withSubmit(async () => {
        console.log('values', _values);
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
        const { error } = await (await authGlobalApiClient.phone.verify_otp.$post({
            form: {
                code: _values.code,
                turnstile: turnstile
            },
        })).json()
        if (error) {
            handleError(error, form);
        } else {
            emit('success');
        }
    });
}
</script>

<template>
    <AutoForm class="space-y-4"
              :schema="schema"
              :field-config="{
                code: {
                    component: AutoFormFieldPin,
                    label: 'SMS Code',
                    inputProps: {
                        // @ts-ignore
                        length: 4,

                        autoFocus: true,
                    },
                },
            }"
              :form="form"
              @submit="onFormSubmit">
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
                Confirm
            </Button>
        </div>
    </AutoForm>
</template>