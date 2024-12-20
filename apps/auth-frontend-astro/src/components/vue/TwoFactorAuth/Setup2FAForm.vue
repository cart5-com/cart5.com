<script setup lang="ts">
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { object as z_object, string as z_string, type infer as z_infer } from "zod";
import { authApiClient } from '@root/lib/authApiClient';
import { onMounted, ref } from 'vue';
import { Input } from '@/components/ui/input';
import Button from '@/components/ui/button/Button.vue';
import CopyButton from '@/ui-plus/CopyButton.vue';
import Separator from '@/ui-plus/separator/Separator.vue';
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from '@/ui-plus/sonner';
import { useFormPlus } from "@/ui-plus/form/useFormPlus";
import { Loader2 } from 'lucide-vue-next';
import { showTurnstile } from '@/ui-plus/dialog/showTurnstile';
import { removeUserFromSession } from '@root/stores/userStore';

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

const schema = z_object({
    userProvidedCode: z_string().length(6, { message: "TOTP code must be 6 digits" }),
})

const formSchema = toTypedSchema(schema)

const form = useForm({
    validationSchema: formSchema,
})

const { isLoading, globalError, handleError, withSubmit } = useFormPlus();

const onSubmit = form.handleSubmit(async (values) => {
    await withSubmit(async () => {
        const { data, error } = await (await authApiClient.api["two-factor-auth"].save.$post({
            form: {
                ...values,
                encodedTOTPKey: props.encodedTOTPKey,
                turnstile: await showTurnstile(import.meta.env.PUBLIC_TURNSTILE_SITE_KEY)
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
            removeUserFromSession();
            emit('close', data);
        }
    })
})
</script>

<template>
    <Separator class="my-10"
               label="Scan a QR code" />


    <div id="qrcode-container"
         ref="qrCodeContainer"
         class="max-w-xs my-4"></div>

    <form class="space-y-6"
          @submit="onSubmit">

        <details class="mb-4 bg-muted rounded-md p-4">
            <summary class="cursor-pointer">
                Or use a setup key
            </summary>
            <div class="mt-4 space-y-4 border-t py-2">
                <label
                       class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Account
                    Name</label>
                <div class="flex items-center space-x-2">
                    <Input type="text"
                           disabled
                           v-model="name"
                           class="flex-1" />
                    <CopyButton :content="name" />
                </div>
                <label
                       class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Key
                </label>
                <div class="flex items-center space-x-2">
                    <Input type="text"
                           disabled
                           v-model="totpKey"
                           class="flex-1" />
                    <CopyButton :content="totpKey" />
                </div>
            </div>
        </details>

        <Separator class="my-10" />

        <FormField v-slot="{ componentField }"
                   name="userProvidedCode">
            <FormItem>
                <FormLabel>Enter generated 6 digit code</FormLabel>
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
    <Button variant="secondary"
            @click="$emit('cancel')"> Cancel </Button>
</template>
