<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { AutoForm } from '@/ui-plus/auto-form'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from "zod";
import { showTurnstilePopup } from 'lib/clientUtils/showTurnstilePopup';
import { useFormPlus } from '@/ui-plus/form/useFormPlus'
import { Loader2 } from 'lucide-vue-next'
import { dashboardApiClient } from '@src/lib/dashboardApiClient';
import { myWebsites } from '@src/stores/WebsiteStore';
import { getTurnstileUrl } from 'lib/clientUtils/getAuthOrigin';
import { toast } from '@/ui-plus/sonner';
import { watch } from 'vue';
import { slugify } from 'lib/utils/slugify';

const emit = defineEmits<{
    close: [values: { id: string, name: string }],
    cancel: [];
    onError: [error: any];
}>();

const schema = z.object({
    name: z.string().max(510, { message: "max 510" }).min(3, { message: "min 3" }),
    defaultHostname: z.string()
        .min(3, { message: "Domain must be at least 3 characters" })
        .max(255, { message: "Domain must be less than 255 characters" })
        .regex(/^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/, {
            message: "Please enter a valid domain name (e.g., www.example.com)"
        }),
})

const form = useForm({
    validationSchema: toTypedSchema(schema),
})

const { isLoading, globalError, handleError, withSubmit } = useFormPlus(form);


watch(() => form.values.name, (newName) => {
    const newSlugifiedName = slugify(newName || '');
    const domain = `${newSlugifiedName}.${import.meta.env.VITE_PUBLIC_DOMAIN_NAME || 'cart5.com'}`;
    form.setFieldValue('defaultHostname', domain);
});

async function onSubmit(values: z.infer<typeof schema>) {
    let turnstile;
    try {
        turnstile = await showTurnstilePopup(
            getTurnstileUrl(import.meta.env.VITE_PUBLIC_DOMAIN_NAME)
        );
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error(errorMessage);
        return;
    }
    await withSubmit(async () => {
        const { data, error } = await (await dashboardApiClient.api_dashboard.website.create.$post({
            form: {
                name: values.name,
                defaultHostname: values.defaultHostname,
                turnstile
            },
        })).json()
        if (error) {
            handleError(error, form);
        } else {
            // Success
            const websiteId = data as string;
            myWebsites.value = [...myWebsites.value, {
                id: websiteId,
                name: values.name,
                defaultHostname: values.defaultHostname
            }];
            emit('close', { id: websiteId, name: values.name });
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
                name: {
                    label: 'Name',
                    description: 'Enter a name for your website',
                },
                defaultHostname: {
                    label: 'Domain',
                }
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
                Create
            </Button>
        </div>
    </AutoForm>
    <Button variant="secondary"
            @click="emit('cancel')"> Cancel </Button>
</template>