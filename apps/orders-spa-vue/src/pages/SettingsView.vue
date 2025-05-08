<script lang="ts" setup>
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Store } from "lucide-vue-next";
import { myStoresFiltered, myStores, searchQuery, loadMyStores } from '@orders-spa-vue/stores/MyStoresStore'
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { addListeningStore, MySettingsStore, removeListeningStore } from "@orders-spa-vue/stores/MySettingsStore";
import { Button } from "@/components/ui/button";
import { ordersApiClient } from "@api-client/orders";
import { Dialog, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogScrollContent, DialogClose, DialogFooter } from "@/components/ui/dialog";

const pairAutoprintDevice = async (storeId: string) => {
    const otp = prompt("one-time-pairing-code ?");
    if (!otp) {
        return;
    }
    const { data, error } = await (await ordersApiClient[":storeId"].pair_autoprint_device.$post({
        param: { storeId },
        json: { otp }
    })).json();
    if (error) {
        console.error(error)
    }
    if (data) {
        console.log(data)
        loadMyStores()
    }
}

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


                            <Dialog>
                                <DialogTrigger>
                                    <Button variant="outline"
                                            size="lg">
                                        Autoprint Settings
                                        <span v-if="store.autoprintDevices?.length"
                                              class="text-xs text-muted-foreground">
                                            ({{ store.autoprintDevices?.length }})
                                        </span>
                                    </Button>
                                </DialogTrigger>
                                <DialogScrollContent>
                                    <DialogHeader>
                                        <DialogTitle>Autoprint Settings</DialogTitle>
                                        <DialogDescription />
                                    </DialogHeader>

                                    <Button variant="outline"
                                            size="lg"
                                            @click="pairAutoprintDevice(store.id)">
                                        Pair a new Autoprint Device
                                    </Button>



                                    <DialogFooter>
                                        <DialogClose as-child>
                                            <Button variant="secondary"
                                                    class="w-full">
                                                Close
                                            </Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogScrollContent>
                            </Dialog>

                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    </div>
</template>