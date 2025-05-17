<script lang="ts" setup>
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Store } from "lucide-vue-next";
import { myStoresFiltered, myStores, searchQuery } from '@orders-spa-vue/stores/MyStoresStore'
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { addListeningStore, MySettingsStore, removeListeningStore } from "@orders-spa-vue/stores/MySettingsStore";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogScrollContent } from "@/components/ui/dialog";
import AutomationRulesView from "@orders-spa-vue/pages/AutomationRulesView.vue";
import SupportTextView from "@orders-spa-vue/pages/SupportTextView.vue";

</script>
<template>
    <div>
        <div class="mb-4"
             v-if="myStores.length > 9">
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
                    <CardContent class="mt-4">
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
                    </CardContent>
                    <CardFooter>
                        <div>


                            <Dialog>
                                <DialogTrigger>
                                    <Button variant="outline"
                                            size="lg">
                                        Automations
                                    </Button>
                                </DialogTrigger>
                                <DialogScrollContent>
                                    <DialogHeader>
                                        <DialogTitle>Automations</DialogTitle>
                                        <DialogDescription />
                                    </DialogHeader>

                                    <AutomationRulesView :store-id="store.id" />

                                </DialogScrollContent>
                            </Dialog>

                            <Dialog>
                                <DialogTrigger>
                                    <Button variant="outline"
                                            size="lg">
                                        Support & Notifications
                                    </Button>
                                </DialogTrigger>
                                <DialogScrollContent>
                                    <DialogHeader>
                                        <DialogTitle>Support & Notifications</DialogTitle>
                                        <DialogDescription />
                                    </DialogHeader>

                                    <SupportTextView :store-id="store.id" />

                                </DialogScrollContent>
                            </Dialog>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    </div>
</template>