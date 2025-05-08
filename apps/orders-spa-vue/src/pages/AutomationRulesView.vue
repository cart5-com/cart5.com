<script lang="ts" setup>
import { ordersApiClient } from '@api-client/orders';
import { computed, onMounted, ref } from 'vue';
import type { ResType } from '@api-client/typeUtils';
import { toast } from '@/ui-plus/sonner';
import { myStores } from '@orders-spa-vue/stores/MyStoresStore';

const ApiPath = ordersApiClient[":storeId"].automation_rules.get.$post;
type AutomationRulesType = ResType<typeof ApiPath>["data"];

const props = defineProps<{
    storeId: string;
}>();

onMounted(async () => {
    loadData();
})

const automationRules = ref<AutomationRulesType | null>(null);
export const currentStore = computed(() => {
    if (!props.storeId) return null;
    return myStores.value.find(store => store.id === props.storeId);
});

async function loadData() {
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
    }
    if (data) {
        console.log(data);
        automationRules.value = data;
    }
}

async function saveData() {
    const { data, error } = await (await ordersApiClient[':storeId'].automation_rules.update.$patch({
        param: { storeId: props.storeId },
        json: {
            autoAcceptOrders: automationRules.value?.autoAcceptOrders,
            autoPrintRules: automationRules.value?.autoPrintRules,
        },
    })).json();
    if (error) {
        console.error(error);
        toast.error(error.message ?? "Error updating automation rules");
    }
    if (data) {
        console.log(data);
        toast.success("Automation rules updated");
    }
}
</script>

<template>
    <div>
        <div class="flex flex-col gap-2">
            <div v-for="device in currentStore?.autoprintDevices"
                 :key="device.autoprintDeviceId">
                {{ device.name }}
                <!-- {{ device.autoprintDeviceId }} -->
                <div v-for="(printer, index) in device.printers"
                     :key="index">
                    {{ index + 1 }}. {{ printer.deviceName }}
                </div>

            </div>
        </div>
    </div>
</template>
