<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { currentStoreId } from '@dashboard-spa-vue/stores/StoreStore';
import { apiClient } from '@api-client/index';
import { onMounted, ref } from 'vue';
import { toast } from '@/ui-plus/sonner';
import { Loader2 } from 'lucide-vue-next';
import { ecomApiCuisines } from '@lib/consts';
import { Input } from '@/components/ui/input';
import { PlusCircleIcon } from 'lucide-vue-next';
import { pageTitle } from '@dashboard-spa-vue/stores/layout.store';

// Common cuisine types - expand this list as needed
const AVAILABLE_CUISINES = ecomApiCuisines;

const customCuisine = ref('');

const addCustomCuisine = () => {
    const cuisine = customCuisine.value.trim();
    if (cuisine && !selectedCuisines.value.includes(cuisine)) {
        selectedCuisines.value.push(cuisine);
        customCuisine.value = ''; // Clear the input
    }
};

const selectedCuisines = ref<string[]>([]);
const isLoading = ref(false);

const loadData = async () => {
    isLoading.value = true;
    try {
        const { data, error } = await (await apiClient.dashboard.store[':storeId'].$post({
            param: {
                storeId: currentStoreId.value ?? '',
            },
            json: {
                columns: {
                    cuisines: true,
                }
            }
        })).json();

        if (error) {
            toast.error('Failed to load cuisines');
        } else if (data?.cuisines) {
            selectedCuisines.value = data.cuisines;
        }
    } catch (error) {
        console.error('Error loading cuisines:', error);
        toast.error('Failed to load cuisines');
    } finally {
        isLoading.value = false;
    }
};

const toggleCuisine = (cuisine: string) => {
    const index = selectedCuisines.value.indexOf(cuisine);
    if (index === -1) {
        selectedCuisines.value.push(cuisine);
    } else {
        selectedCuisines.value.splice(index, 1);
    }
};

const saveCuisines = async () => {
    isLoading.value = true;
    try {
        const { error } = await (await apiClient.dashboard.store[':storeId'].$patch({
            param: {
                storeId: currentStoreId.value ?? '',
            },
            json: {
                cuisines: selectedCuisines.value
            }
        })).json();

        if (error) {
            toast.error('Failed to save cuisines');
        } else {
            toast.success('Cuisines saved successfully');
        }
    } catch (error) {
        console.error('Error saving cuisines:', error);
        toast.error('Failed to save cuisines');
    } finally {
        isLoading.value = false;
    }
};

pageTitle.value = 'Cuisine'

onMounted(() => {
    loadData();
});
</script>

<template>
    <div>
        <h1 class="text-2xl font-bold mb-6">What type of cuisine do you serve?</h1>
        <div class="max-w-3xl mx-auto">


            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                <Card v-for="cuisine in [...AVAILABLE_CUISINES, ...selectedCuisines.filter(c => !AVAILABLE_CUISINES.includes(c))]"
                      :key="cuisine"
                      :class="[
                        'cursor-pointer transition-colors p-4 text-center hover:bg-muted/50',
                        selectedCuisines.includes(cuisine) ? 'bg-primary/10 border-primary' : ''
                    ]"
                      @click="toggleCuisine(cuisine)">
                    {{ cuisine }}
                </Card>
            </div>

            <div class="flex gap-2 mb-6">
                <Input v-model="customCuisine"
                       placeholder="Add your own cuisine type"
                       @keyup.enter="addCustomCuisine"
                       class="max-w-xs" />
                <Button variant="outline"
                        size="icon"
                        @click="addCustomCuisine">
                    <PlusCircleIcon class="h-4 w-4" />
                </Button>
            </div>

            <div class="flex justify-between items-center gap-4">
                <!-- <RouterLink :to="{ name: 'store-address' }">
                    <Button variant="outline">Back</Button>
                </RouterLink> -->
                <Button @click="saveCuisines"
                        class="w-full my-6"
                        :disabled="isLoading">
                    <Loader2 v-if="isLoading"
                             class="animate-spin mr-2 h-4 w-4" />
                    Save
                </Button>
            </div>
        </div>
    </div>
</template>