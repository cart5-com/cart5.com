<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { AutoForm } from '@/ui-plus/auto-form'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from "zod";
import { showTurnstilePopup } from '@lib/clientUtils/showTurnstilePopup';
import { useFormPlus } from '@/ui-plus/form/useFormPlus'
import { ArrowLeftIcon, Loader2 } from 'lucide-vue-next'
import { dashboardApiClient } from '@api-client/dashboard';
import { loadMyWebsites, myWebsites } from '@dashboard-spa-vue/stores/MyWebsitesStore';
import { getTurnstileUrl } from '@lib/clientUtils/getAuthOrigin';
import { toast } from '@/ui-plus/sonner';
import { insertWebsitesSchema } from '@db/schema/website.schema';
import HeaderOnly from '@dashboard-spa-vue/layouts/HeaderOnly.vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { websiteInfo, loadWebsiteInfo } from '@dashboard-spa-vue/stores/WebsiteInfoStore';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(async () => {
    await loadWebsiteInfo();
})

const schema = z.object({
    name: insertWebsitesSchema.shape.name,
})

const form = useForm({
    validationSchema: toTypedSchema(schema),
})

const { isLoading, globalError, handleError, withSubmit } = useFormPlus(form);

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
        const { data, error } = await (await dashboardApiClient.dashboard.website.create.$post({
            form: {
                name: values.name,
                turnstile
            },
        })).json()
        if (error) {
            handleError(error, form);
        } else {
            // Success
            const websiteId = data.id;
            myWebsites.value = [...myWebsites.value, {
                id: websiteId,
                name: values.name,
                defaultHostname: null
            }];
            // redirect to the new website
            loadMyWebsites();
            router.push({ name: 'website-home', params: { websiteId } });
        }
    })
}

</script>

<template>
    <HeaderOnly>
        <Card class="max-w-md mx-auto">
            <CardHeader>
                <CardTitle>
                    <RouterLink :to="{ name: 'my-websites' }">
                        <Button variant="secondary"
                                class="w-full mb-4">
                            <ArrowLeftIcon /> Back
                        </Button>
                    </RouterLink>
                    Add New Website
                </CardTitle>
            </CardHeader>
            <CardContent>
                <AutoForm class="space-y-6"
                          :schema="schema"
                          :form="form"
                          @submit="onSubmit"
                          :field-config="{
                            name: {
                                label: 'Name',
                                description: 'Enter a name for your website',
                            },
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
                <div class="flex flex-col gap-2 mb-4 border p-4 rounded-md border-foreground">
                    <div>
                        Support Organization:
                        <Badge variant="secondary">
                            {{ websiteInfo?.partnerInfo?.name }}
                            ({{ websiteInfo?.partnerInfo?.defaultHostname }})
                        </Badge>
                        <div class="text-sm text-muted-foreground">
                            This support team will be able to help you manage and maintain this new website.
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

    </HeaderOnly>
</template>