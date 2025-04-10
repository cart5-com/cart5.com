<script setup lang="ts">
import { dashboardApiClient } from '@api-client/dashboard';
import type { ResType } from '@api-client/typeUtils';
import { pageTitle } from '@dashboard-spa-vue/stores/LayoutStore';
import { currentWebsiteId } from '@dashboard-spa-vue/stores/MyWebsitesStore';
import { onMounted, ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
    Pagination,
    PaginationList,
    PaginationListItem,
    PaginationNext,
    PaginationPrev,
    PaginationFirst,
    PaginationLast,
    PaginationEllipsis
} from '@/components/ui/pagination';
import { Plus, Search, Check, X } from 'lucide-vue-next';
import { toast } from '@/ui-plus/sonner';
import { ServiceFee } from '@lib/zod/serviceFee';
import ServiceFeeDialog from './ServiceFeeDialog.vue';
import { Badge } from '@/components/ui/badge';


type StoresResponse = ResType<
    typeof dashboardApiClient.website[':websiteId']['stores']['list']['$get']
>["data"];

pageTitle.value = 'Stores';

const stores = ref<StoresResponse['stores']>([]);
const loading = ref(false);
const totalItems = ref(0);
const limit = ref(10);
const offset = ref(0);
const searchQuery = ref('');
const currentPage = ref(1);

const loadStores = async () => {
    loading.value = true;
    const { data, error } = await (await dashboardApiClient.website[':websiteId'].stores.list.$get({
        param: { websiteId: currentWebsiteId.value ?? '' },
        query: {
            limit: String(limit.value),
            offset: String(offset.value),
            search: searchQuery.value || undefined
        }
    })).json();

    if (error) {
        console.error(error);
        toast.error('Failed to load stores');
    } else if (data) {
        stores.value = data.stores;
        totalItems.value = data.pagination.total;
    }
    loading.value = false;
};

const upsertStore = async (storeId: string, overrideMarketplaceFee?: ServiceFee) => {
    const { error } = await (await dashboardApiClient.website[':websiteId'].stores.upsert.$post({
        param: { websiteId: currentWebsiteId.value ?? '' },
        json: { storeId, overrideMarketplaceFee }
    })).json();

    if (error) {
        console.error(error);
        toast.error('Failed to save store');
    } else {
        toast.success('saved');
        // update listed field in stores array
        stores.value = stores.value.map(r => r.id === storeId ? { ...r, isListed: true } : r);
    }
};

const removeStore = async (storeId: string) => {
    const { error } = await (await dashboardApiClient.website[':websiteId'].stores.remove.$post({
        param: { websiteId: currentWebsiteId.value ?? '' },
        json: { storeId }
    })).json();

    if (error) {
        console.error(error);
        toast.error('Failed to remove store');
    } else {
        toast.success('Store removed from website');
        // update listed field in stores array
        stores.value = stores.value.map(r => r.id === storeId ? { ...r, isListed: false } : r);
    }
};

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



onMounted(async () => {
    loadMarketplaceMode();
    loadStores();
});

const isMarketplaceMode = ref(false);
const defaultMarketplaceFee = ref<ServiceFee>({
    ratePerOrder: 0,
    feePerOrder: 0
});

const loadMarketplaceMode = async () => {
    const { data, error } = await (await dashboardApiClient.website[':websiteId'].$post({
        param: { websiteId: currentWebsiteId.value ?? '' },
        json: {
            columns: {
                isMarketplace: true,
                defaultMarketplaceFee: true,
            }
        }
    })).json();
    if (error) {
        console.error(error);
        toast.error('Failed to load marketplace mode');
    } else if (data) {
        isMarketplaceMode.value = data.isMarketplace;
        defaultMarketplaceFee.value = data.defaultMarketplaceFee || {
            ratePerOrder: 0,
            feePerOrder: 0
        };
    }
}

const onMarketplaceModeChange = async (checked: boolean) => {
    isMarketplaceMode.value = checked;
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
            isMarketplace: isMarketplaceMode.value,
            defaultMarketplaceFee: defaultMarketplaceFee.value,
        }
    })).json();
    if (error) {
        console.error(error);
        toast.error('Failed to update marketplace mode');
    } else if (data) {
        toast.success('Marketplace settings updated');
    }
}
</script>

<template>
    <div class="max-w-3xl mx-auto">
        <Card class="mb-4">
            <CardHeader>
                <CardTitle>Marketplace Settings</CardTitle>
                <CardDescription>Configure your marketplace mode and fee settings.</CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
                <div class="flex items-center justify-between p-4 border rounded-lg cursor-pointer">
                    <div class="space-y-0.5">
                        <h3 class="text-lg font-medium">Marketplace mode</h3>
                        <p class="text-muted-foreground">Do you want to allow all available stores to be listed on your
                            website?</p>
                    </div>
                    <div class="flex items-center space-x-3">
                        <Switch id="marketplaceMode"
                                :checked="isMarketplaceMode"
                                @update:checked="onMarketplaceModeChange"
                                class="scale-125">
                        </Switch>
                        <span class="font-medium">{{ isMarketplaceMode ? 'Yes' : 'No' }}</span>
                    </div>
                </div>

                <div class="space-y-4 border p-2 rounded-lg">
                    <h2 class="text-lg font-medium">Default Marketplace Fee</h2>
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
                                   v-model="defaultMarketplaceFee.ratePerOrder"
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
                                   v-model="defaultMarketplaceFee.feePerOrder"
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
                <CardTitle>Store Management</CardTitle>
                <CardDescription>
                    Manage which stores appear on your website. Only stores you add to this list will be
                    visible to your website visitors.
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
                        <div v-for="store in stores"
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
                                <span v-if="store.isListed || isMarketplaceMode"
                                      class="text-sm text-primary flex items-center mr-2">
                                    <Check class="h-4 w-4 mr-1" />
                                    Listed
                                </span>
                                <span v-else
                                      class="text-sm text-muted-foreground flex items-center mr-2">
                                    <X class="h-4 w-4 mr-1" />
                                    Not Listed
                                </span>

                                <div v-if="!isMarketplaceMode">
                                    <Button v-if="!store.isListed"
                                            size="sm"
                                            @click="upsertStore(store.id)">
                                        <Plus class="h-4 w-4 mr-1" />
                                        Add
                                    </Button>
                                    <Button v-else
                                            size="sm"
                                            variant="destructive"
                                            @click="removeStore(store.id)">
                                        <X class="h-4 w-4 mr-1" />
                                        Remove
                                    </Button>
                                </div>
                                <div v-if="store.overrideMarketplaceFee">
                                    <Badge variant="outline">
                                        {{ store.overrideMarketplaceFee?.ratePerOrder }}%
                                    </Badge>
                                    <Badge variant="outline">
                                        +{{ store.overrideMarketplaceFee?.feePerOrder }}
                                    </Badge>
                                </div>
                                <ServiceFeeDialog :store-id="store.id"
                                                  :override-fee="store.overrideMarketplaceFee ?? {}"
                                                  @upsert-store="(storeId, overrideMarketplaceFee) => {
                                                    console.log('overrideMarketplaceFee', overrideMarketplaceFee);
                                                    store.overrideMarketplaceFee = overrideMarketplaceFee ?? null;
                                                    upsertStore(storeId, overrideMarketplaceFee ?? undefined);
                                                }" />

                            </div>
                        </div>

                        <!-- Empty state -->
                        <div v-if="stores.length === 0"
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