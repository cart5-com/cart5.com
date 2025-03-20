<script setup lang="ts">
import { apiClient } from '@api-client/index';
import { pageTitle } from '@src/stores/layout.store';
import { currentWebsiteId } from '@src/stores/WebsiteStore';
import { onMounted, ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import type { ResType } from '@api-client/index';
import { Plus, Search, Check, X } from 'lucide-vue-next';
import { toast } from '@/ui-plus/sonner';

type RestaurantsResponse = ResType<
    typeof apiClient.dashboard.website[':websiteId']['restaurants']['list']['$get']
>["data"];

pageTitle.value = 'Restaurants';

const restaurants = ref<RestaurantsResponse['restaurants']>([]);
const loading = ref(false);
const totalItems = ref(0);
const limit = ref(10);
const offset = ref(0);
const searchQuery = ref('');
const currentPage = ref(1);

const loadRestaurants = async () => {
    loading.value = true;
    const { data, error } = await (await apiClient.dashboard.website[':websiteId'].restaurants.list.$get({
        param: { websiteId: currentWebsiteId.value ?? '' },
        query: {
            limit: String(limit.value),
            offset: String(offset.value),
            search: searchQuery.value || undefined
        }
    })).json();

    if (error) {
        console.error(error);
        toast.error('Failed to load restaurants');
    } else if (data) {
        restaurants.value = data.restaurants;
        totalItems.value = data.pagination.total;
    }
    loading.value = false;
};

const addRestaurant = async (restaurantId: string) => {
    const { error } = await (await apiClient.dashboard.website[':websiteId'].restaurants.add.$post({
        param: { websiteId: currentWebsiteId.value ?? '' },
        json: { restaurantId }
    })).json();

    if (error) {
        console.error(error);
        toast.error('Failed to add restaurant');
    } else {
        toast.success('Restaurant added to website');
        // update listed field in restaurants array
        restaurants.value = restaurants.value.map(r => r.id === restaurantId ? { ...r, isListed: true } : r);
    }
};

const removeRestaurant = async (restaurantId: string) => {
    const { error } = await (await apiClient.dashboard.website[':websiteId'].restaurants.remove.$post({
        param: { websiteId: currentWebsiteId.value ?? '' },
        json: { restaurantId }
    })).json();

    if (error) {
        console.error(error);
        toast.error('Failed to remove restaurant');
    } else {
        toast.success('Restaurant removed from website');
        // update listed field in restaurants array
        restaurants.value = restaurants.value.map(r => r.id === restaurantId ? { ...r, isListed: false } : r);
    }
};

// let debounceTimer: ReturnType<typeof setTimeout> | undefined;
const handleSearch = () => {
    // clearTimeout(debounceTimer);
    // debounceTimer = setTimeout(() => {
    offset.value = 0;
    currentPage.value = 1;
    loadRestaurants();
    // }, 1000);
};

const handlePageChange = (page: number) => {
    console.log('handlePageChange', page);
    currentPage.value = page;
    offset.value = (page - 1) * limit.value;
    loadRestaurants();
};

onMounted(() => {
    loadRestaurants();
});
</script>

<template>
    <div class="max-w-3xl mx-auto">
        <Card>
            <CardHeader>
                <CardTitle>Restaurant Management</CardTitle>
                <CardDescription>
                    Add or remove restaurants to your website. Only listed restaurants will appear on your website.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div class="space-y-6">
                    <!-- Search bar -->
                    <div class="flex gap-2">
                        <div class="relative flex-1">
                            <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input type="search"
                                   placeholder="Search restaurants..."
                                   v-model="searchQuery"
                                   class="pl-8"
                                   @keyup.enter="handleSearch" />
                        </div>
                        <Button @click="handleSearch">Search</Button>
                    </div>

                    <!-- Restaurants list -->
                    <div v-if="!loading"
                         class="space-y-4">
                        <div v-for="restaurant in restaurants"
                             :key="restaurant.id"
                             class="flex items-center justify-between p-4 border rounded-lg">
                            <div class="flex flex-col">
                                <span class="font-medium">{{ restaurant.name }}</span>
                                <span v-if="restaurant.address1"
                                      class="text-sm text-muted-foreground">
                                    {{ restaurant.address1 }}
                                </span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span v-if="restaurant.isListed"
                                      class="text-sm text-primary flex items-center mr-2">
                                    <Check class="h-4 w-4 mr-1" />
                                    Listed
                                </span>
                                <span v-else
                                      class="text-sm text-muted-foreground flex items-center mr-2">
                                    <X class="h-4 w-4 mr-1" />
                                    Not Listed
                                </span>

                                <Button v-if="!restaurant.isListed"
                                        size="sm"
                                        @click="addRestaurant(restaurant.id)">
                                    <Plus class="h-4 w-4 mr-1" />
                                    Add
                                </Button>
                                <Button v-else
                                        size="sm"
                                        variant="destructive"
                                        @click="removeRestaurant(restaurant.id)">
                                    <X class="h-4 w-4 mr-1" />
                                    Remove
                                </Button>
                            </div>
                        </div>

                        <!-- Empty state -->
                        <div v-if="restaurants.length === 0"
                             class="p-8 text-center text-muted-foreground">
                            No restaurants found. Try adjusting your search.
                        </div>
                    </div>

                    <!-- Loading state -->
                    <div v-else
                         class="p-8 text-center text-muted-foreground">
                        Loading restaurants...
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