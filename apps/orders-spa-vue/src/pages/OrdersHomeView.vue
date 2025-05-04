<script lang="ts" setup>
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Store } from "lucide-vue-next";
import { myStoresFiltered, myStores, searchQuery } from '@orders-spa-vue/stores/MyStoresStore'
import HeaderOnly from '@orders-spa-vue/layouts/HeaderOnly.vue';

const IS_DEV = import.meta.env.DEV;

</script>

<template>
    <HeaderOnly>
        <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex flex-col gap-1">
                <h3 class="text-2xl font-bold tracking-tight">
                    <Store class="inline-block mr-1" />
                    My Stores
                </h3>
                <!-- <p class="text-muted-foreground text-sm">As a manager, you can view and manage all your stores
                    below.</p> -->
            </div>
        </div>
        <div class="mb-4"
             v-if="myStores.length > 9 || IS_DEV">
            <Input v-model="searchQuery"
                   placeholder="Search by name or address"
                   class="max-w-sm" />
        </div>
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div v-for="store in myStoresFiltered"
                 :key="store.id"
                 class="block">
                <Card class="bg-muted hover:bg-muted/20 h-24 transition-colors">
                    <CardHeader>
                        <CardTitle class="text-lg">
                            <Store class="inline-block mr-1" />
                            {{ store.name }}
                        </CardTitle>
                        <CardDescription>{{ store.address1 }}</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        </div>
    </HeaderOnly>
</template>
