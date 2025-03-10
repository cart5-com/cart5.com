<script lang="ts" setup>
import { dashboardApiClient } from '@src/lib/dashboardApiClient';
import { pageTitle } from '@src/stores/layout.store';
import { currentWebsiteId } from '@src/stores/WebsiteStore';
import { onMounted, ref } from 'vue';
import { Button } from '@/components/ui/button';
import { type ResType } from 'lib/hono/apiClients/ecomApiClient'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type WebsiteType = ResType<
    typeof dashboardApiClient.api_dashboard.website[':websiteId']["$post"]
>["data"];

pageTitle.value = 'Domains'

const website = ref<WebsiteType>();

const loadData = async () => {
    if (!currentWebsiteId.value) return;
    const { data, error } = await (await dashboardApiClient.api_dashboard.website[':websiteId'].$post({
        param: { websiteId: currentWebsiteId.value },
        json: {
            columns: {
                name: true,
                defaultHostname: true,
                domains: {
                    hostname: true,
                }
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
    if (!currentWebsiteId.value) return;
    await dashboardApiClient.api_dashboard.website[':websiteId'].domain['set-default'].$post({
        param: {
            websiteId: currentWebsiteId.value,
        },
        json: {
            hostname
        }
    });
    loadData();
};

const removeDomain = async (hostname: string) => {
    if (!currentWebsiteId.value) return;
    await dashboardApiClient.api_dashboard.website[':websiteId'].domain['remove'].$post({
        param: {
            websiteId: currentWebsiteId.value,
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
            <CardDescription>Use your own domain for free.</CardDescription>
        </CardHeader>
        <CardContent>
            <div class="space-y-6">
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