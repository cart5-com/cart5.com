<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { AutoForm } from '@/ui-plus/auto-form'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from "zod";
import { useFormPlus } from '@/ui-plus/form/useFormPlus'
import { Loader2 } from 'lucide-vue-next'
import { dashboardApiClient } from '@src/lib/dashboardApiClient';
import { currentWebsiteId, currentWebsite } from '@src/stores/WebsiteStore';
import { toast } from '@/ui-plus/sonner';
import { useRouter } from 'vue-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { pageTitle } from '@src/stores/layout.store';
import { slugify } from 'lib/utils/slugify';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-vue-next';

pageTitle.value = 'Add Domain'
const router = useRouter();

const VITE_PUBLIC_DNS_CHECK_IPV4 = import.meta.env.VITE_PUBLIC_DNS_CHECK_IPV4;
const VITE_PUBLIC_DNS_CHECK_IPV6 = import.meta.env.VITE_PUBLIC_DNS_CHECK_IPV6;
const VITE_PUBLIC_DNS_CHECK_POINTER = import.meta.env.VITE_PUBLIC_DNS_CHECK_POINTER;

const schema = z.object({
    hostname: z.string()
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
        const { error } = await (await dashboardApiClient.api_dashboard.website[':websiteId'].domain.add.$post({
            param: { websiteId: currentWebsiteId.value || '' },
            json: { hostname: values.hostname }
        })).json()

        if (error) {
            handleError(error, form);
            toast.error("Failed to add domain");
        } else {
            toast.success("Domain added successfully");
            router.push({ name: 'website-domains' });
        }
    })
}

const hostname = `${slugify(currentWebsite.value?.name || 'your-website')}.${import.meta.env.VITE_PUBLIC_DOMAIN_NAME}`;
async function setSubdomain() {
    form.setFieldValue('hostname', hostname);
    // submit the form
    await onSubmit(form.values as z.infer<typeof schema>);
}
</script>

<template>
    <div class="max-w-lg mx-auto">
        <Card>
            <CardHeader>
                <CardTitle>Add New Domain</CardTitle>
                <CardDescription>Add a custom domain to your website for free.</CardDescription>
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
                        or You may use our subdomain to skip the DNS setup.
                        <br>
                        Recommendation:
                        <Button variant="secondary"
                                @click="setSubdomain">
                            {{ hostname }}
                        </Button>
                    </div>

                    <!-- DNS Setup Guide -->
                    <Alert class="bg-muted">
                        <InfoIcon class="h-4 w-4" />
                        <AlertDescription>
                            <h3 class="font-medium mb-2">DNS Configuration Help</h3>
                            <p class="text-sm mb-2">Before adding your domain, you must configure the DNS settings at
                                your domain registrar. The DNS records must be properly propagated for validation to
                                succeed.</p>

                            <Accordion type="single"
                                       collapsible
                                       class="w-full">
                                <AccordionItem value="option-1">
                                    <AccordionTrigger class="text-sm font-medium">Option 1: CNAME Record (Recommended)
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div class="space-y-2 text-sm">
                                            <p>Create a CNAME record pointing to our server:</p>
                                            <div class="bg-background p-2 rounded border">
                                                <div><span class="font-mono">Type:</span> CNAME</div>
                                                <div><span class="font-mono">Host/Name:</span> www or @ (for root
                                                    domain)</div>
                                                <div><span class="font-mono">Value/Target:</span>
                                                    {{ VITE_PUBLIC_DNS_CHECK_POINTER }}
                                                </div>
                                                <div><span class="font-mono">TTL:</span> Automatic or 3600</div>
                                            </div>
                                            <p class="text-xs text-muted-foreground mt-2">Note: Some registrars don't
                                                allow CNAME records for root domains. In that case, use Option 2 or
                                                enable CNAME flattening if available.</p>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="option-2">
                                    <AccordionTrigger class="text-sm font-medium">Option 2: A and AAAA Records
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div class="space-y-2 text-sm">
                                            <p>Create A record (IPv4) and AAAA record (IPv6) pointing to our servers:
                                            </p>
                                            <div class="bg-background p-2 rounded border mb-2">
                                                <div><span class="font-mono">Type:</span> A</div>
                                                <div><span class="font-mono">Host/Name:</span> @ (for root domain) or
                                                    subdomain</div>
                                                <div><span class="font-mono">Value/Target:</span>
                                                    {{ VITE_PUBLIC_DNS_CHECK_IPV4 }}
                                                </div>
                                                <div><span class="font-mono">TTL:</span> Automatic or 3600</div>
                                            </div>
                                            <div class="bg-background p-2 rounded border">
                                                <div><span class="font-mono">Type:</span> AAAA</div>
                                                <div><span class="font-mono">Host/Name:</span> @ (for root domain) or
                                                    subdomain</div>
                                                <div><span class="font-mono">Value/Target:</span>
                                                    {{ VITE_PUBLIC_DNS_CHECK_IPV6 }}
                                                </div>
                                                <div><span class="font-mono">TTL:</span> Automatic or 3600</div>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="dns-propagation">
                                    <AccordionTrigger class="text-sm font-medium">DNS Propagation Check
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div class="space-y-2 text-sm">
                                            <p>Before attempting to add your domain:</p>
                                            <ul class="list-disc pl-5 space-y-1">
                                                <li>Wait for DNS changes to propagate (can take 24-48 hours)</li>
                                                <li>Verify your DNS configuration using <a href="https://dnschecker.org"
                                                       target="_blank"
                                                       class="text-primary underline">dnschecker.org</a></li>
                                                <li>Only proceed with domain addition once DNS records are properly
                                                    propagated</li>
                                            </ul>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </AlertDescription>
                    </Alert>


                </div>
            </CardContent>
        </Card>
    </div>
</template>