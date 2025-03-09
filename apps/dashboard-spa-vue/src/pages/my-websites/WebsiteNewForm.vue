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
import { computed } from 'vue';
import { extractBaseDomain } from 'lib/utils/extractBaseDomain';
import { toast } from '@/ui-plus/sonner';

const emit = defineEmits<{
    close: [values: { id: string, name: string }],
    cancel: [];
    onError: [error: any];
}>();

const schema = z.object({
    name: z.string().max(510, { message: "max 510" }).min(3, { message: "min 3" }),
    defaultHostname: z.string()
        .max(63, { message: "Subdomain must be 63 characters or less" })
        .min(3, { message: "Subdomain must be at least 3 characters" })
        .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/, {
            message: "Subdomain can only contain lowercase letters, numbers, and hyphens. It cannot start or end with a hyphen."
        }),
})

const form = useForm({
    validationSchema: toTypedSchema(schema),
})

const { isLoading, globalError, handleError, withSubmit } = useFormPlus(form);

const baseDomain = extractBaseDomain(window.location.host);
const previewDomain = computed(() => {
    const hostname = form.values.defaultHostname;
    return hostname ? `${hostname}.${baseDomain}` : `[subdomain].${baseDomain}`;
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
        const fullHostname = `${values.defaultHostname}.${baseDomain}`;

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
            myWebsites.value = [...myWebsites.value, { id: data, name: values.name, defaultHostname: fullHostname, domains: [] }];
            emit('close', { id: data, name: values.name });
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
                    label: 'Default Hostname',
                    description: 'Enter a subdomain for your website (e.g., mysite)',
                }
            }">
        <div class="text-sm text-muted-foreground mt-2 mb-4">
            Your website will be accessible at: <span class="font-medium">{{ previewDomain }}</span>
        </div>
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