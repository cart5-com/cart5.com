<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Trash2, Star } from 'lucide-vue-next'
import { dashboardApiClient } from '@src/lib/dashboardApiClient'
import { currentWebsiteId } from '@src/stores/WebsiteStore'
import { onMounted, ref } from 'vue'
import { useToast } from '@/components/ui/toast/use-toast'
import { z } from 'zod'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { useFormPlus } from '@/ui-plus/form/useFormPlus'

const { toast } = useToast()

// watch(() => form.values.name, (newName) => {
//     const newSlugifiedName = slugify(newName || '');
//     const domain = `${newSlugifiedName}.${import.meta.env.VITE_PUBLIC_DOMAIN_NAME || 'cart5.com'}`;
//     form.setFieldValue('defaultHostname', domain);
// });

interface Domain {
    hostname: string
    isDefault: boolean
}

const domains = ref<Domain[]>([])
const defaultHostname = ref('')
const newDomain = ref('')

// Form validation
const schema = z.object({
    hostname: z.string()
        .min(3, { message: 'Domain must be at least 3 characters' })
        .max(255, { message: 'Domain must be less than 255 characters' })
        .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/, {
            message: 'Please enter a valid domain name (e.g., example.com)'
        })
})

const form = useForm({
    validationSchema: toTypedSchema(schema),
    initialValues: {
        hostname: ''
    }
})

const { isLoading, globalError, handleError, withSubmit } = useFormPlus(form)


// Load domains on mount
onMounted(async () => {
    if (!currentWebsiteId.value) return

    isLoading.value = true
    try {
        const { data, error } = await (await dashboardApiClient.api_dashboard.website[':websiteId'].$post({
            param: { websiteId: currentWebsiteId.value },
            json: {
                columns: {
                    defaultHostname: true,
                    domains: {
                        hostname: true
                    }
                }
            }
        })).json()

        if (error) {
            handleError(error, form)
        } else if (data) {
            defaultHostname.value = data.defaultHostname || ''

            // Map domains and mark the default one
            if (data.domains) {
                domains.value = data.domains
                    .filter((domain): domain is { hostname: string; websiteId: string } =>
                        typeof domain === 'object' && domain !== null && 'hostname' in domain)
                    .map(domain => ({
                        hostname: domain.hostname,
                        isDefault: domain.hostname === data.defaultHostname
                    }))
            }
        }
    } catch (error) {
        console.error(error)
        handleError(error, form)
    } finally {
        isLoading.value = false
    }
})

// Add a new domain
async function addDomain() {
    await withSubmit(async () => {
        const { valid } = await form.validate()
        if (!valid) return

        const hostname = form.values.hostname
        if (!hostname) return

        const { error } = await (await dashboardApiClient.api_dashboard.website[':websiteId'].domain.$post({
            param: { websiteId: currentWebsiteId.value as string },
            json: {
                hostname
            }
        })).json()

        if (error) {
            handleError(error, form)
        } else {
            // Add the new domain to the list
            domains.value.push({
                hostname,
                isDefault: false
            })

            // Clear the input
            newDomain.value = ''
            form.resetField('hostname')

            toast({
                title: 'Domain added',
                description: `${hostname} has been added to your website.`
            })
        }
    })
}

// Set a domain as default
async function setAsDefault(hostname: string) {
    if (hostname === defaultHostname.value) return
    await withSubmit(async () => {
        const { error } = await (await dashboardApiClient.api_dashboard.website[':websiteId'].domain.default.$patch({
            param: { websiteId: currentWebsiteId.value as string },
            json: {
                hostname
            }
        })).json()

        if (error) {
            handleError(error, form)
        } else {
            // Update the default domain
            defaultHostname.value = hostname

            // Update the isDefault flag for all domains
            domains.value = domains.value.map(domain => ({
                ...domain,
                isDefault: domain.hostname === hostname
            }))

            toast({
                title: 'Default domain updated',
                description: `${hostname} is now your default domain.`
            })
        }
    })
}

// Remove a domain
async function removeDomain(hostname: string) {
    if (hostname === defaultHostname.value) {
        // Check if there are other domains that could be set as default
        const otherDomains = domains.value.filter(d => d.hostname !== hostname);
        if (otherDomains.length > 0) {
            handleError({ message: 'Cannot remove the default domain. Set another domain as default first.' }, form)
            return;
        }
        // If this is the only domain, allow removal
    }

    await withSubmit(async () => {
        const { error } = await (await dashboardApiClient.api_dashboard.website[':websiteId'].domain[':hostname'].$delete({
            param: {
                websiteId: currentWebsiteId.value as string,
                hostname
            }
        })).json()

        if (error) {
            handleError(error, form)
        } else {
            // Remove the domain from the list
            domains.value = domains.value.filter(domain => domain.hostname !== hostname);

            // If we removed the default domain, clear the default hostname
            if (hostname === defaultHostname.value) {
                defaultHostname.value = '';
            }

            toast({
                title: 'Domain removed',
                description: `${hostname} has been removed from your website.`
            });
        }
    })
}

</script>

<template>
    <div class="space-y-6">
        <!-- Loading state -->
        <div v-if="isLoading"
             class="flex justify-center items-center py-8">
            <Loader2 class="h-8 w-8 animate-spin" />
        </div>

        <div v-else
             class="space-y-6">

            <!-- No default domain message -->
            <div v-if="!defaultHostname && domains.length === 0"
                 class="bg-warning/15 text-warning p-4 rounded-md mb-4">
                Your website doesn't have a default domain yet. Add a domain below and set it as default.
            </div>

            <!-- Add new domain form -->
            <Card>
                <CardHeader>
                    <CardTitle>Add New Domain</CardTitle>
                    <CardDescription>
                        Add a new domain to your website. You can set it as the default domain after adding.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form @submit.prevent="addDomain"
                          class="flex items-end gap-4">
                        <div class="flex-1">
                            <Input v-model="newDomain"
                                   placeholder="example.com"
                                   :disabled="isLoading"
                                   @update:modelValue="(val) => form.setFieldValue('hostname', String(val))" />
                        </div>
                        <div class="text-sm font-medium text-destructive"
                             v-if="globalError">
                            {{ globalError }}
                        </div>
                        <Button type="submit"
                                :disabled="isLoading">
                            <Loader2 v-if="isLoading"
                                     class="mr-2 h-4 w-4 animate-spin" />
                            <Plus v-else
                                  class="mr-2 h-4 w-4" />
                            Add Domain
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <!-- Domains list -->
            <Card>
                <CardHeader>
                    <CardTitle>Your Domains</CardTitle>
                    <CardDescription>
                        Manage your website domains. The default domain is used as the primary domain for your website.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Domain</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead class="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow v-for="domain in domains"
                                      :key="domain.hostname">
                                <TableCell>{{ domain.hostname }}</TableCell>
                                <TableCell>
                                    <Badge v-if="domain.isDefault"
                                           variant="default">Default</Badge>
                                    <Badge v-else
                                           variant="outline">Active</Badge>
                                </TableCell>
                                <TableCell class="text-right">
                                    <div class="flex justify-end gap-2">
                                        <Button v-if="!domain.isDefault"
                                                variant="outline"
                                                size="sm"
                                                :disabled="isLoading"
                                                @click="setAsDefault(domain.hostname)">
                                            <Loader2 v-if="isLoading"
                                                     class="mr-2 h-3 w-3 animate-spin" />
                                            <Star v-else
                                                  class="mr-2 h-3 w-3" />
                                            Set as Default
                                        </Button>
                                        <Button v-if="!domain.isDefault"
                                                variant="destructive"
                                                size="sm"
                                                :disabled="isLoading"
                                                @click="removeDomain(domain.hostname)">
                                            <Loader2 v-if="isLoading"
                                                     class="mr-2 h-3 w-3 animate-spin" />
                                            <Trash2 v-else
                                                    class="mr-2 h-3 w-3" />
                                            Remove
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </div>
    </div>
</template>