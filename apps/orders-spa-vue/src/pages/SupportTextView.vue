<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { toast } from '@/ui-plus/sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-vue-next';
import { dashboardApiClient } from '@api-client/dashboard';

const props = defineProps<{
    storeId: string;
}>();

onMounted(async () => {
    loadData();
});

const supportText = ref<string>('');
const isLoading = ref(false);
const isSaving = ref(false);

async function loadData() {
    isLoading.value = true;
    try {
        const { data, error } = await (await dashboardApiClient.store[':storeId'].$post({
            param: {
                storeId: props.storeId,
            },
            json: {
                columns: {
                    orderSupportByStoreText: true,
                }
            }
        })).json()

        if (error) {
            console.error(error);
            toast.error(error.message ?? "Error fetching support text");
            return;
        }

        if (data) {
            supportText.value = data.orderSupportByStoreText || '';
        }
    } finally {
        isLoading.value = false;
    }
}

async function saveData() {
    isSaving.value = true;
    try {
        const { data, error } = await (await dashboardApiClient.store[':storeId'].$patch({
            param: {
                storeId: props.storeId,
            },
            json: {
                orderSupportByStoreText: supportText.value,
            }
        })).json()

        if (error) {
            console.error(error);
            toast.error(error.message ?? "Error updating support text");
            return;
        }

        if (data) {
            toast.success("Support text updated");
        }
    } finally {
        isSaving.value = false;
    }
}
</script>

<template>
    <div class="">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
             v-if="isLoading"></div>
        <div v-else
             class="mt-4 border rounded-md p-4">
            <h3 class="text-lg font-medium mb-4">Customer Support Information</h3>

            <div class="space-y-2">
                <Label for="support-text">Support Details</Label>
                <Textarea id="support-text"
                          v-model="supportText"
                          placeholder="Enter support information that will be displayed to customers"
                          class="min-h-[150px]" />
                <p class="text-sm text-muted-foreground">
                    This text will be displayed on your store page and order details to help customers reach you.
                    We recommend including your store phone numbers and any other contact details.
                </p>
            </div>

            <Button @click="saveData"
                    :disabled="isSaving"
                    class="w-full mt-4">
                <Save class="h-4 w-4 mr-2" />
                <span>Save Changes</span>
            </Button>
        </div>
    </div>
</template>
