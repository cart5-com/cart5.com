<script lang="ts" setup>
import { dashboardApiClient } from '@src/lib/dashboardApiClient';
import { pageTitle } from '@src/stores/layout.store';
import { currentWebsiteId } from '@src/stores/WebsiteStore';
import { onMounted, ref } from 'vue';
import { Button } from '@/components/ui/button';
import { type ResType } from 'lib/hono/apiClients/ecomApiClient'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-vue-next';

type WebsiteType = ResType<
    typeof dashboardApiClient.api_dashboard.website[':websiteId']['domain']['list']['$post']
>["data"];

pageTitle.value = 'Domains'

const website = ref<WebsiteType>();

const loadData = async () => {
    const { data, error } = await (await dashboardApiClient.api_dashboard.website[':websiteId'].domain.list.$post({
        param: { websiteId: currentWebsiteId.value ?? '' },
        json: {
            columns: {
                hostname: true,
            },
        }
    })).json();
    if (error) {
        console.error(error);
    } else if (data) {
        website.value = data;
        // if (!data.defaultHostname) {
        //     router.push({ name: 'website-domains-add' });
        // }
    }
};

const makeDefault = async (hostname: string) => {
    await dashboardApiClient.api_dashboard.website[':websiteId'].domain['set_default'].$post({
        param: {
            websiteId: currentWebsiteId.value ?? '',
        },
        json: {
            hostname
        }
    });
    loadData();
};

const removeDomain = async (hostname: string) => {
    await dashboardApiClient.api_dashboard.website[':websiteId'].domain['remove'].$post({
        param: {
            websiteId: currentWebsiteId.value ?? '',
        },
        json: {
            hostname
        }
    });
    loadData();
};

onMounted(async () => {
    loadData();
});

</script>

<template>
    <Card>
        <CardHeader>
            <CardTitle>Domain Management</CardTitle>
            <CardDescription>Use your own domain.</CardDescription>
        </CardHeader>
        <CardContent>
            <div class="space-y-6">
                <Alert variant="destructive"
                       v-if="!website?.defaultHostname">
                    <AlertTriangle class="h-4 w-4" />
                    <AlertDescription>
                        No default domain is set. Please set a default domain to make your website accessible.
                    </AlertDescription>
                </Alert>
                <Alert v-else-if="website?.domains && website?.domains?.length > 1">
                    <AlertTriangle class="h-4 w-4" />
                    <AlertDescription>
                        All domains will be redirected to the default domain.
                    </AlertDescription>
                </Alert>

                <div class="flex justify-end">
                    <router-link :to="{ name: 'website-domains-add' }">
                        <Button>Add new domain</Button>
                    </router-link>
                </div>

                <div v-if="website?.domains"
                     class="space-y-4">
                    <div v-for="domain in website.domains"
                         :key="domain.hostname"
                         class="flex items-center justify-between p-4 border rounded-lg">
                        <span>{{ domain.hostname }}</span>
                        <div class="space-x-2">
                            <span v-if="website.defaultHostname === domain.hostname"
                                  class="text-sm text-muted-foreground">
                                Default Domain
                            </span>
                            <Button v-if="website.defaultHostname !== domain.hostname"
                                    variant="outline"
                                    @click="makeDefault(domain.hostname)">
                                Make Default
                            </Button>
                            <!-- v-if="website.defaultHostname !== domain.hostname" -->
                            <Button variant="destructive"
                                    @click="removeDomain(domain.hostname)">
                                Remove
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
</template>