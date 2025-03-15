<script lang="ts" setup>
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-vue-next';
import CopyButton from '@/ui-plus/CopyButton.vue'

const VITE_PUBLIC_DNS_CHECK_POINTER = import.meta.env.VITE_PUBLIC_DNS_CHECK_POINTER;
const VITE_PUBLIC_DNS_CHECK_IPV4 = import.meta.env.VITE_PUBLIC_DNS_CHECK_IPV4;
const VITE_PUBLIC_DNS_CHECK_IPV6 = import.meta.env.VITE_PUBLIC_DNS_CHECK_IPV6;

</script>

<template>
    <Alert class="how-to-connect-domain-alert">
        <InfoIcon class="h-4 w-4" />
        <AlertDescription>
            <h3 class="font-medium mb-2">How to Connect Your Domain</h3>
            <p class="text-sm mb-2">Follow these simple steps to connect your domain. If you need help,
                contact your domain provider's support team.</p>

            <Accordion type="multiple"
                       collapsible
                       class="w-full space-y-10">
                <AccordionItem value="step-1">
                    <AccordionTrigger class="text-sm font-medium">Step 1: Log into your domain provider
                    </AccordionTrigger>
                    <AccordionContent>
                        <div class="space-y-2 text-sm">
                            <p>Common domain providers include:</p>
                            <ul class="list-disc pl-5 space-y-1">
                                <li>GoDaddy</li>
                                <li>Namecheap</li>
                                <li>Google Domains</li>
                                <li>Domain.com</li>
                            </ul>
                            <p>Log into the website where you bought your domain name.</p>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step-2">
                    <AccordionTrigger class="text-sm font-medium">Step 2: Find DNS settings
                    </AccordionTrigger>
                    <AccordionContent>
                        <div class="space-y-2 text-sm">
                            <p>Look for one of these options in your domain provider's menu:</p>
                            <ul class="list-disc pl-5 space-y-1">
                                <li>"Manage DNS"</li>
                                <li>"DNS Settings"</li>
                                <li>"Domain Settings"</li>
                                <li>"Name Servers"</li>
                            </ul>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step-3">
                    <AccordionTrigger class="text-sm font-medium">Step 3: Add DNS records
                    </AccordionTrigger>
                    <AccordionContent>
                        <div class="space-y-4 text-sm">
                            <div>
                                <p class="font-medium mb-2">Option 1: Connect www subdomain*</p>
                                <p class="font-medium mb-2">(www.yourdomain.com)</p>
                                <p class="text-sm mb-2">This is the recommended way to connect your domain. Add this
                                    CNAME record:</p>
                                <div class="bg-muted p-2 rounded border mt-1 space-y-2">
                                    <div class="flex items-center space-x-2">
                                        <span class="font-mono">Type:</span>
                                        <CopyButton content="CNAME">CNAME</CopyButton>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <span class="font-mono">Name/Host:</span>
                                        <CopyButton content="www">www</CopyButton>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <span class="font-mono">Points to/Value:</span>
                                        <CopyButton :content="VITE_PUBLIC_DNS_CHECK_POINTER">
                                            {{ VITE_PUBLIC_DNS_CHECK_POINTER }}
                                        </CopyButton>
                                    </div>
                                    <div><span class="font-mono">TTL:</span> Automatic (or 3600)</div>
                                </div>
                            </div>

                            <div class="pt-20">
                                <p class="font-medium mb-2">Option 2: Connect root domain</p>
                                <p class="font-medium mb-2">(yourdomain.com)</p>
                                <p class="text-sm mb-2">Some domain registrars don't allow CNAME records for root
                                    domains. In this case, you'll need to use A and AAAA records below, or enable CNAME
                                    flattening if your provider offers it (e.g. Cloudflare).</p>
                                <div class="bg-muted p-2 rounded border mt-1 space-y-2">
                                    <div class="flex items-center space-x-2">
                                        <span class="font-mono">Type:</span>
                                        <CopyButton content="A">A</CopyButton>
                                    </div>
                                    <div><span class="font-mono">Name/Host:</span>
                                        <CopyButton content="@">@</CopyButton> or leave empty
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <span class="font-mono">Points to/Value:</span>
                                        <CopyButton :content="VITE_PUBLIC_DNS_CHECK_IPV4">
                                            {{ VITE_PUBLIC_DNS_CHECK_IPV4 }}
                                        </CopyButton>
                                    </div>
                                    <div><span class="font-mono">TTL:</span> Automatic (or 3600)</div>
                                </div>

                                <div class="bg-muted p-2 rounded border mt-2 space-y-2">
                                    <div class="flex items-center space-x-2">
                                        <span class="font-mono">Type:</span>
                                        <CopyButton content="AAAA">AAAA</CopyButton>
                                    </div>
                                    <div><span class="font-mono">Name/Host:</span>
                                        <CopyButton content="@">@</CopyButton> or leave empty
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <span class="font-mono">Points to/Value:</span>
                                        <CopyButton :content="VITE_PUBLIC_DNS_CHECK_IPV6">
                                            {{ VITE_PUBLIC_DNS_CHECK_IPV6 }}
                                        </CopyButton>
                                    </div>
                                    <div><span class="font-mono">TTL:</span> Automatic (or 3600)</div>
                                </div>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step-4">
                    <AccordionTrigger class="text-sm font-medium">Step 4: Wait for DNS to update
                    </AccordionTrigger>
                    <AccordionContent>
                        <div class="space-y-2 text-sm">
                            <p>After saving your DNS records:</p>
                            <ul class="list-disc pl-5 space-y-1">
                                <li>Wait 5-10 minutes</li>
                                <li>Return to this page</li>
                                <li>Try adding your domain</li>
                            </ul>
                            <p class="mt-2">DNS changes can sometimes take up to 24 hours to fully
                                propagate.</p>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </AlertDescription>
    </Alert>
</template>
