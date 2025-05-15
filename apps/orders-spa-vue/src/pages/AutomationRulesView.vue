<script lang="ts" setup>
import { ordersApiClient } from '@api-client/orders';
import { computed, onMounted, ref } from 'vue';
import type { ResType } from '@api-client/typeUtils';
import { toast } from '@/ui-plus/sonner';
import { loadMyStores, myStores } from '@orders-spa-vue/stores/MyStoresStore';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusIcon, Trash2Icon, Save, Info } from 'lucide-vue-next';
import { generateKey } from '@lib/utils/generateKey';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '@/components/ui/hover-card'

const ApiPath = ordersApiClient[":storeId"].automation_rules.get.$post;
type AutomationRulesType = ResType<typeof ApiPath>["data"];

const props = defineProps<{
    storeId: string;
}>();

onMounted(async () => {
    loadData();
})

const automationRules = ref<Partial<AutomationRulesType> | null>({
    autoAcceptOrders: false,
    autoPrintRules: [],
});
const isLoading = ref(false);
const isSaving = ref(false);

const currentStore = computed(() => {
    if (!props.storeId) return null;
    return myStores.value.find(store => store.id === props.storeId);
});

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
        toast.success("Paired successfully");
        console.log(data)
        loadMyStores()
    }
}


async function loadData() {
    isLoading.value = true;
    try {
        const { data, error } = await (await ordersApiClient[':storeId'].automation_rules.get.$post({
            param: { storeId: props.storeId },
            json: {
                columns: {
                    autoAcceptOrders: true,
                    autoPrintRules: true,
                }
            }
        })).json();

        if (error) {
            console.error(error);
            toast.error(error.message ?? "Error fetching automation rules");
            return;
        }

        if (data) {
            automationRules.value = data;
        }
    } finally {
        isLoading.value = false;
    }
}

async function saveData() {
    if (!automationRules.value) return;

    isSaving.value = true;
    try {
        const { data, error } = await (await ordersApiClient[':storeId'].automation_rules.update.$patch({
            param: { storeId: props.storeId },
            json: {
                autoAcceptOrders: automationRules.value.autoAcceptOrders,
                autoPrintRules: automationRules.value.autoPrintRules,
            },
        })).json();

        if (error) {
            console.error(error);
            toast.error(error.message ?? "Error updating automation rules");
            return;
        }

        if (data) {
            console.log(data);
            toast.success("Automation rules updated");
        }
    } finally {
        isSaving.value = false;
    }
}

function addNewRule() {
    if (!automationRules.value) return;

    automationRules.value.autoPrintRules = automationRules.value.autoPrintRules || [];
    automationRules.value.autoPrintRules.push({
        id: generateKey('rule'),
        isActive: true,
        autoAcceptOrderAfterPrint: false,
        copies: 1,
    });
}

function removeRule(index: number) {
    if (!automationRules.value?.autoPrintRules) return;
    automationRules.value.autoPrintRules.splice(index, 1);
}

const disableOtherRules = (ruleId?: string) => {
    if (!automationRules.value?.autoPrintRules) return;
    if (ruleId) {
        automationRules.value.autoAcceptOrders = false;
    }
    automationRules.value.autoPrintRules.forEach(rule => {
        if (rule.id !== ruleId) {
            rule.autoAcceptOrderAfterPrint = false;
        }
    });
}
</script>

<template>
    <div class="">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
             v-if="isLoading"></div>
        <div v-else-if="automationRules">

            <div class="border rounded-md p-4">
                <h3 class="text-lg font-medium mb-4">Paired auto print devices</h3>
                <div class="space-y-4 max-h-[500px] overflow-y-auto">
                    <div v-for="(device, index) in currentStore?.autoprintDevices"
                         :key="device.autoprintDeviceId"
                         class="p-4">
                        <h4 class="font-medium">{{ index + 1 }}. Device Name: {{ device.name }}</h4>
                        <!-- <p class="text-xs text-muted-foreground mb-2">ID: {{ device.autoprintDeviceId }}</p> -->
                        <div v-if="device.printers?.length"
                             class="mt-2">
                            <h5 class="text-sm font-medium mb-1">Available Printers:</h5>
                            <ul class="pl-4 text-sm">
                                <li v-for="(printer, index) in device.printers"
                                    :key="index"
                                    class="list-disc list-inside">
                                    {{ index + 1 }}. Printer Name: {{ printer.deviceName }}
                                </li>
                            </ul>
                        </div>
                        <p v-else
                           class="text-sm text-muted-foreground">No printers configured</p>
                    </div>
                </div>
                <Button variant="outline"
                        size="lg"
                        @click="pairAutoprintDevice(storeId)">
                    Pair a new Autoprint Device
                </Button>
            </div>


            <div class="mt-4 border rounded-md p-4">
                <h3 class="text-lg font-medium mb-4">Automation Rules</h3>
                <div class="flex items-center space-x-2 ">
                    <Switch id="auto-accept-orders"
                            v-model:checked="automationRules.autoAcceptOrders"
                            @update:checked="(checked: boolean) => {
                                if (checked) {
                                    disableOtherRules();
                                }
                            }" />
                    <Label for="auto-accept-orders">
                        Auto-acceptance
                    </Label>
                </div>
                <p class="text-sm text-muted-foreground mt-2 mb-6">
                    (Automatically accept all incoming orders)
                    When turned on, new orders will be automatically accepted without your intervention.
                    This happens even when you're offline or if the orders aren't being printed.
                    This setting works independently from any print rules you set up.
                </p>

                <div class="mb-4 flex justify-between items-center">
                    <h3 class="text-lg font-medium">Print Rules</h3>
                    <Button @click="addNewRule"
                            variant="outline"
                            class="mt-4">
                        <PlusIcon class="h-4 w-4 mr-2" />
                        <span>Add Print Rule</span>
                    </Button>
                </div>

                <div v-if="automationRules.autoPrintRules?.length"
                     class="space-y-4 max-h-[500px] overflow-y-auto">
                    <div v-for="(rule, index) in automationRules.autoPrintRules"
                         :key="rule.id"
                         class="border p-4 ">
                        <div class="flex justify-between items-start mb-2">
                            <div class="flex items-center space-x-2">
                                <Switch :id="`rule-active-${rule.id}`"
                                        v-model:checked="rule.isActive" />
                                <Label :for="`rule-active-${rule.id}`">Active</Label>
                            </div>
                            <Button @click="removeRule(index)"
                                    variant="ghost"
                                    size="icon"
                                    class="h-8 w-8">
                                <Trash2Icon class="h-4 w-4" />
                            </Button>
                        </div>

                        <div class="grid grid-cols-1 gap-4 mt-4">
                            <div>
                                <Label for="autoprintDeviceId">Print Device</Label>
                                <Select v-model="rule.autoprintDeviceId">
                                    <SelectTrigger class="w-full">
                                        <SelectValue placeholder="Select device" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem v-if="currentStore?.autoprintDevices?.length"
                                                    v-for="device in currentStore.autoprintDevices"
                                                    :key="device.autoprintDeviceId"
                                                    :value="device.autoprintDeviceId">
                                            {{ device.name }}
                                        </SelectItem>
                                        <SelectItem v-else
                                                    value="none"
                                                    disabled>No devices found</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div v-if="rule.autoprintDeviceId">
                                <Label for="printerDeviceName">Printer</Label>
                                <Select v-model="rule.printerDeviceName">
                                    <SelectTrigger class="w-full">
                                        <SelectValue placeholder="Select printer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <template v-if="currentStore?.autoprintDevices">
                                            <template v-for="device in currentStore.autoprintDevices"
                                                      :key="device.autoprintDeviceId">
                                                <SelectItem v-if="device.autoprintDeviceId === rule.autoprintDeviceId && device.printers?.length"
                                                            v-for="printer in device.printers"
                                                            :key="printer.deviceName"
                                                            :value="printer.deviceName">
                                                    {{ printer.deviceName }}
                                                </SelectItem>
                                            </template>
                                        </template>
                                        <SelectItem v-else
                                                    value="none"
                                                    disabled>No printers found</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label for="copies">Copies</Label>
                                <Input id="copies"
                                       type="number"
                                       min="1"
                                       v-model="rule.copies" />
                            </div>

                            <div class="flex items-center space-x-2">
                                <Switch :id="`auto-accept-${rule.id}`"
                                        v-model:checked="rule.autoAcceptOrderAfterPrint"
                                        @update:checked="(checked: boolean) => {
                                            if (checked) {
                                                disableOtherRules(rule.id);
                                            }
                                        }" />
                                <Label :for="`auto-accept-${rule.id}`">
                                    Auto accept order after print
                                    <HoverCard>
                                        <HoverCardTrigger as-child>
                                            <Info class="inline-block" />
                                        </HoverCardTrigger>
                                        <HoverCardContent align="start">
                                            <p>
                                                When enabled, orders will be automatically marked as accepted after
                                                the print job is sent. Note that this happens regardless of whether
                                                the print was successful, as the system cannot verify the printer's
                                                actual status.
                                            </p>
                                        </HoverCardContent>
                                    </HoverCard>
                                </Label>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-else
                     class="text-center py-8 border rounded-md bg-muted/10">
                    <p class="text-muted-foreground mb-4">No print rules configured</p>
                </div>

                <Button @click="saveData"
                        :disabled="isSaving"
                        class="w-full mt-4">
                    <Save class="h-4 w-4 mr-2" />
                    <span>Save Changes</span>
                </Button>
            </div>

        </div>
    </div>
</template>
