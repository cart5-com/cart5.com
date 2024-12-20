<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { toast } from '@/ui-plus/sonner'
import { useFormPlus } from "ui-shadcn-vue/src/ui-plus/form/useFormPlus";
import { toTypedSchema } from "@vee-validate/zod";
import { authApiClient } from "@root/lib/authApiClient";
import { useForm } from "vee-validate";
import { object as z_object, string as z_string, type infer as z_infer } from "zod";
import { Eye, Loader2 } from 'lucide-vue-next';
import { showTurnstile } from '@/ui-plus/dialog/showTurnstile';
import { $userStore } from '@root/stores/userStore';
import { Input } from '@/components/ui/input';

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
const onSubmit = form.handleSubmit(async (values) => {
    await withSubmit(async () => {
        const { error } = await (await authApiClient.api.user['update-password'].$post({
            form: {
                password: values.password,
                turnstile: await showTurnstile(import.meta.env.PUBLIC_TURNSTILE_SITE_KEY)
            },
        })).json()
        if (error) {
            handleError(error, form);
        } else {
            toast.success("Password updated");
            emit("cancel");
        }
    })
})
</script>

<template>

    <form class="space-y-6"
          @submit="onSubmit">
        <FormField v-slot="{ componentField }"
                   name="email">
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
                   name="password">
            <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                    <Input type="password"
                           autocomplete="new-password"
                           v-bind="componentField" />
                </FormControl>
                <FormMessage />
            </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }"
                   name="confirm">
            <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                    <Input type="password"
                           autocomplete="new-password"
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
                Update
            </Button>
        </div>
    </form>
    <Button variant="secondary"
            @click="emit('cancel')"> Cancel </Button>
</template>