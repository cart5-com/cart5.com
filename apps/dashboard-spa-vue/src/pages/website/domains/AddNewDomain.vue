<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { AutoForm } from '@/ui-plus/auto-form'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from "zod";
import { useFormPlus } from '@/ui-plus/form/useFormPlus'
import { Loader2 } from 'lucide-vue-next'
import { apiClient } from '@api-client/index';
import { currentWebsiteId, currentWebsite } from '@src/stores/WebsiteStore';
import { toast } from '@/ui-plus/sonner';
import { useRouter } from 'vue-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { pageTitle } from '@src/stores/layout.store';
import { slugify } from '@lib/utils/slugify';
import HowTo from './HowTo.vue';
import { shakeElem } from '@lib/clientUtils/shakeElem';

pageTitle.value = 'Add Domain'
const router = useRouter();

const isLocal = window.location.host.includes('localhost:');

const schema = z.object({
    hostname: isLocal
        ?
        z.string()
            .min(3, { message: "Domain name must be at least 3 characters" })
            .max(255, { message: "Domain name must be less than 255 characters" })
        :
        z.string()
            .min(3, { message: "Domain name must be at least 3 characters" })
            .max(255, { message: "Domain name must be less than 255 characters" })
            .regex(/^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/, {
                message: "Please enter a valid domain name (e.g. example.com)"
            })
})

const form = useForm({
    validationSchema: toTypedSchema(schema),
})

const { isLoading, globalError, handleError, withSubmit } = useFormPlus(form);

async function onSubmit(values: z.infer<typeof schema>) {
    await withSubmit(async () => {
        const { error } = await (await apiClient.dashboard.website[':websiteId'].domain.add.$post({
            param: { websiteId: currentWebsiteId.value || '' },
            json: { hostname: values.hostname }
        })).json()

        if (error) {
            handleError(error, form);
            if (error.code === "INVALID_DNS") {
                const howToConnectDomainAlert = document.querySelector<HTMLElement>('.how-to-connect-domain-alert')
                if (howToConnectDomainAlert) {
                    shakeElem(howToConnectDomainAlert)
                }
            }
            toast.error("Failed to add domain");
        } else {
            if (values.hostname.includes(import.meta.env.VITE_PUBLIC_DOMAIN_NAME)) {
                toast.success("Domain added successfully");
            } else {
                try {
                    (await (await fetch(`https://${values.hostname}/`)).text());
                } catch (error) { }
                toast.success("Domain added successfully👍 SSL🛡️ will be activated in 5-10 minutes");
            }
            router.push({ name: 'website-domains' });
        }
    })
}

const hostname = `${slugify(currentWebsite.value?.name || 'your-website')}.${import.meta.env.VITE_PUBLIC_DOMAIN_NAME}`;
async function setSubdomain() {
    form.setFieldValue('hostname', hostname);
}

async function setLocalhost() {
    form.setFieldValue('hostname', 'localhost:3002');
}
</script>

<template>
    <div class="max-w-lg mx-auto">
        <Card>
            <CardHeader>
                <CardTitle>Add New Domain</CardTitle>
                <CardDescription>Add a custom domain to your website.</CardDescription>
            </CardHeader>
            <CardContent class="p-6">
                <div class="space-y-6">

                    <AutoForm class="space-y-6"
                              :schema="schema"
                              :form="form"
                              @submit="onSubmit"
                              :field-config="{
                                hostname: {
                                    label: 'Domain Name',
                                    description: 'Enter your domain name (e.g. www.example.com)',
                                },
                            }">
                        <div class="text-sm font-medium text-destructive"
                             v-if="globalError">
                            {{ globalError }}
                        </div>
                        <div>
                            <Button type="submit"
                                    :disabled="isLoading"
                                    class="w-full">
                                <Loader2 v-if="isLoading"
                                         class="mr-2 h-4 w-4 animate-spin" />
                                Add Domain
                            </Button>
                        </div>
                    </AutoForm>

                    <div class="text-sm font-medium text-muted-foreground border-t pt-4">
                        or You may use a subdomain of our domain to skip the DNS setup.
                        <br>
                        Recommendation:
                        <Button variant="secondary"
                                @click="setSubdomain">
                            use '{{ hostname }}'
                        </Button>
                        <template v-if="isLocal">
                            <br><br>
                            For local development:
                            <Button variant="secondary"
                                    @click="setLocalhost">
                                use 'localhost:3002'
                            </Button>
                        </template>
                    </div>

                    <!-- DNS Setup Guide -->
                    <HowTo />


                </div>
            </CardContent>
        </Card>
    </div>
</template>