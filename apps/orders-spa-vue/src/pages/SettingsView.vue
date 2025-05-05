<script lang="ts" setup>
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Store } from "lucide-vue-next";
import { myStoresFiltered, myStores, searchQuery } from '@orders-spa-vue/stores/MyStoresStore'
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { addListeningStore, MySettingsStore, removeListeningStore } from "@orders-spa-vue/stores/MySettingsStore";

const IS_DEV = import.meta.env.DEV;
</script>
<template>
    <div>
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
                <Card class="hover:bg-card/70 transition-colors">
                    <CardHeader>
                        <CardTitle class="text-lg">
                            <Store class="inline-block mr-1" />
                            {{ store.name }}
                        </CardTitle>
                        <CardDescription>{{ store.address1 }}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <div class="flex items-center gap-2">
                            <Label for="store-{{ store.id }}">
                                {{ MySettingsStore[store.id]?.isEnabled ? 'Enabled' : 'Disabled' }}
                            </Label>
                            <Switch id="store-{{ store.id }}"
                                    :checked="MySettingsStore[store.id]?.isEnabled"
                                    @update:checked="($event) => {
                                        if ($event) {
                                            addListeningStore(store.id);
                                        } else {
                                            removeListeningStore(store.id);
                                        }
                                    }" />
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    </div>
</template>