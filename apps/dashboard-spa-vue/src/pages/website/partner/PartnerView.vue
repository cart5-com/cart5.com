<script setup lang="ts">
import { dashboardApiClient } from '@api-client/dashboard';
import { pageTitle } from '@dashboard-spa-vue/stores/LayoutStore';
import { currentWebsiteId } from '@dashboard-spa-vue/stores/MyWebsitesStore';
import { onMounted, ref } from 'vue';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/ui-plus/sonner';
import { ResType } from '@api-client/typeUtils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationList, PaginationListItem, PaginationFirst, PaginationPrev, PaginationNext, PaginationLast, PaginationEllipsis } from '@/components/ui/pagination';
import ServiceFeeDialog from '../stores/ServiceFeeDialog.vue';
import { type ServiceFee } from '@lib/zod/serviceFee';

type SupportedStoresResponse = ResType<
    typeof dashboardApiClient.website[':websiteId']['supported_stores']['list']['$get']
>["data"];

pageTitle.value = 'Stores';

const supportedStores = ref<SupportedStoresResponse['stores']>([]);
const loading = ref(false);
const totalItems = ref(0);
const limit = ref(10);
const offset = ref(0);
const searchQuery = ref('');
const currentPage = ref(1);

const upsertStore = async (storeId: string, overridePartnerFee?: ServiceFee) => {
    const { error } = await (await dashboardApiClient.website[':websiteId'].supported_stores.upsert.$post({
        param: { websiteId: currentWebsiteId.value ?? '' },
        json: { storeId, overridePartnerFee }
    })).json();

    if (error) {
        console.error(error);
        toast.error('Failed to save store');
    } else {
        toast.success('saved');
        // update listed field in stores array
        supportedStores.value = supportedStores.value.map(r => r.id === storeId ? { ...r, overridePartnerFee: overridePartnerFee ?? null } : r);
    }
};

const loadStores = async () => {
    loading.value = true;
    const { data, error } = await (await dashboardApiClient.website[':websiteId'].supported_stores.list.$get({
        param: { websiteId: currentWebsiteId.value ?? '' },
        query: {
            limit: String(limit.value),
            offset: String(offset.value),
            search: searchQuery.value || undefined
        }
    })).json();
    if (error) {
        console.error(error);
        toast.error('Failed to load supported stores');
    } else if (data) {
        supportedStores.value = data.stores;
        totalItems.value = data.pagination.total;
    }
    loading.value = false;
}

onMounted(async () => {
    loadPartner();
    loadStores();
});


// let debounceTimer: ReturnType<typeof setTimeout> | undefined;
const handleSearch = () => {
    // clearTimeout(debounceTimer);
    // debounceTimer = setTimeout(() => {
    offset.value = 0;
    currentPage.value = 1;
    loadStores();
    // }, 1000);
};

const handlePageChange = (page: number) => {
    console.log('handlePageChange', page);
    currentPage.value = page;
    offset.value = (page - 1) * limit.value;
    loadStores();
};

const isPartner = ref(false);
const defaultPartnerFee = ref<ServiceFee>({
    ratePerOrder: 0,
    feePerOrder: 0
});

const loadPartner = async () => {
    const { data, error } = await (await dashboardApiClient.website[':websiteId'].$post({
        param: { websiteId: currentWebsiteId.value ?? '' },
        json: {
            columns: {
                isPartner: true,
                defaultPartnerFee: true,
            }
        }
    })).json();
    if (error) {
        console.error(error);
        toast.error('Failed to load partner');
    } else if (data) {
        isPartner.value = data.isPartner;
        defaultPartnerFee.value = data.defaultPartnerFee || {
            ratePerOrder: 0,
            feePerOrder: 0
        };
    }
}

const onPartnerChange = async (checked: boolean) => {
    isPartner.value = checked;
    await saveChanges();
}

let debounceTimer: ReturnType<typeof setTimeout> | undefined;
const onFeeChange = async () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
        await saveChanges();
    }, 1000);
}

const saveChanges = async () => {
    const { data, error } = await (await dashboardApiClient.website[':websiteId'].$patch({
        param: { websiteId: currentWebsiteId.value ?? '' },
        json: {
            isPartner: isPartner.value,
            defaultPartnerFee: defaultPartnerFee.value,
        }
    })).json();
    if (error) {
        console.error(error);
        toast.error('Failed to update partner');
    } else if (data) {
        toast.success('Partner settings updated');
    }
}
</script>

<template>
    <div>
        <div class="max-w-3xl mx-auto">
            <label for="partner"
                   class="flex items-center justify-between p-4 border rounded-lg cursor-pointer max-w-sm mx-auto mb-4">
                <div class="space-y-0.5">
                    <h3 class="text-lg font-medium">Partner</h3>
                    <p class="text-muted-foreground">
                        Become a partner to support other stores and get a commission from their sales.
                    </p>
                </div>
                <div class="flex items-center space-x-3">
                    <Switch id="partner"
                            :checked="isPartner"
                            @update:checked="onPartnerChange"
                            class="scale-125">
                    </Switch>
                    <span class="font-medium">{{ isPartner ? 'Yes' : 'No' }}</span>
                </div>
            </label>
        </div>

        <Card class="mb-4">
            <CardHeader>
                <CardTitle>Partner Settings</CardTitle>
                <CardDescription>Configure your partner mode and fee settings.</CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">

                <div class="space-y-4 border p-2 rounded-lg">
                    <h2 class="text-lg font-medium">Default Partner Fee</h2>
                    <p class="text-muted-foreground">This fee will be applied to all stores that are listed on your
                        website.
                    </p>
                    <p class="text-muted-foreground">
                        Also, you may override these fees with the gear button on each store.
                    </p>
                    <div class="grid gap-4">
                        <div class="space-y-2">
                            <label for="ratePerOrder"
                                   class="text-sm font-medium">Rate per Order (%)</label>
                            <Input id="ratePerOrder"
                                   type="number"
                                   min="0"
                                   step="0.01"
                                   v-model="defaultPartnerFee.ratePerOrder"
                                   @change="onFeeChange"
                                   class="max-w-[200px]" />
                            <p class="text-sm text-muted-foreground">Percentage fee charged per order</p>
                        </div>

                        <div class="space-y-2">
                            <label for="feePerOrder"
                                   class="text-sm font-medium">Fixed Fee per Order</label>
                            <Input id="feePerOrder"
                                   type="number"
                                   min="0"
                                   step="0.01"
                                   v-model="defaultPartnerFee.feePerOrder"
                                   @change="onFeeChange"
                                   class="max-w-[200px]" />
                            <p class="text-sm text-muted-foreground">Fixed fee amount charged per order</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Supported Stores</CardTitle>
                <CardDescription>
                    Your team can override the default partner fee for stores that you provide support to.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div class="space-y-6">
                    <!-- Search bar -->
                    <div class="flex gap-2">
                        <div class="relative flex-1">
                            <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input type="search"
                                   placeholder="Search stores..."
                                   v-model="searchQuery"
                                   class="pl-8"
                                   @keyup.enter="handleSearch" />
                        </div>
                        <Button @click="handleSearch">Search</Button>
                    </div>

                    <!-- Stores list -->
                    <div v-if="!loading"
                         class="space-y-4">
                        <div v-for="store in supportedStores"
                             :key="store.id"
                             class="flex items-center justify-between p-4 border rounded-lg">
                            <div class="flex flex-col">
                                <span class="font-medium">{{ store.name }}</span>
                                <span v-if="store.address1"
                                      class="text-sm text-muted-foreground">
                                    {{ store.address1 }}
                                </span>
                            </div>
                            <div class="flex items-center gap-2">
                                <div v-if="store.overridePartnerFee">
                                    <Badge variant="outline">
                                        {{ store.overridePartnerFee?.ratePerOrder }}%
                                    </Badge>
                                    <Badge variant="outline">
                                        +{{ store.overridePartnerFee?.feePerOrder }}
                                    </Badge>
                                </div>
                                <ServiceFeeDialog :store-id="store.id"
                                                  :override-fee="store.overridePartnerFee ?? {}"
                                                  @upsert-store="(storeId, overridePartnerFee) => {
                                                    console.log('overridePartnerFee', overridePartnerFee);
                                                    store.overridePartnerFee = overridePartnerFee ?? null;
                                                    upsertStore(storeId, overridePartnerFee ?? undefined);
                                                }" />

                            </div>
                        </div>

                        <!-- Empty state -->
                        <div v-if="supportedStores.length === 0"
                             class="p-8 text-center text-muted-foreground">
                            No stores found. Try adjusting your search.
                        </div>
                    </div>

                    <!-- Loading state -->
                    <div v-else
                         class="p-8 text-center text-muted-foreground">
                        Loading stores...
                    </div>

                    <!-- Pagination -->
                    <div v-if="totalItems > 0"
                         class="flex justify-center mt-4">
                        <Pagination :items-per-page="limit"
                                    :total="totalItems"
                                    :sibling-count="1"
                                    show-edges
                                    v-model:page="currentPage"
                                    @update:page="handlePageChange">
                            <PaginationList v-slot="{ items }"
                                            class="flex items-center gap-1">
                                <PaginationFirst />
                                <PaginationPrev />

                                <template v-for="(item, index) in items">
                                    <PaginationListItem v-if="item.type === 'page'"
                                                        :key="index"
                                                        :value="item.value"
                                                        as-child>
                                        <Button class="w-9 h-9 p-0"
                                                :variant="item.value === currentPage ? 'default' : 'outline'">
                                            {{ item.value }}
                                        </Button>
                                    </PaginationListItem>
                                    <PaginationEllipsis v-else
                                                        :key="item.type"
                                                        :index="index" />
                                </template>

                                <PaginationNext />
                                <PaginationLast />
                            </PaginationList>
                        </Pagination>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
</template>