<script setup lang="ts">
import { dashboardApiClient } from '@api-client/dashboard';
import { pageTitle } from '@dashboard-spa-vue/stores/LayoutStore';
import { currentWebsiteId } from '@dashboard-spa-vue/stores/MyWebsitesStore';
import { onMounted, ref } from 'vue';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/ui-plus/sonner';


pageTitle.value = 'Partner';


onMounted(async () => {
    loadPartner();
});

const isPartner = ref(false);
const loadPartner = async () => {
    const { data, error } = await (await dashboardApiClient.website[':websiteId'].$post({
        param: { websiteId: currentWebsiteId.value ?? '' },
        json: {
            columns: {
                isPartner: true,
            }
        }
    })).json();
    if (error) {
        console.error(error);
        toast.error('Failed to load partner');
    } else if (data) {
        isPartner.value = data.isPartner;
    }
}

const onPartnerChange = async (checked: boolean) => {
    isPartner.value = checked;
    const { data, error } = await (await dashboardApiClient.website[':websiteId'].$patch({
        param: { websiteId: currentWebsiteId.value ?? '' },
        json: {
            isPartner: checked,
        }
    })).json();
    if (error) {
        console.error(error);
        toast.error('Failed to update partner');
    } else if (data) {
        toast.success('Partner updated');
    }
}
</script>

<template>
    <div class="max-w-3xl mx-auto">
        <label for="partner"
               class="flex items-center justify-between p-4 border rounded-lg cursor-pointer max-w-sm mx-auto mb-4">
            <div class="space-y-0.5">
                <h3 class="text-lg font-medium">Partner</h3>
                <p class="text-muted-foreground">
                    Become a partner to support other stores and get a commission from their sales.
                </p>
            </div>
            <div class="flex items-center space-x-3">
                <Switch id="partner"
                        :checked="isPartner"
                        @update:checked="onPartnerChange"
                        class="scale-125">
                </Switch>
                <span class="font-medium">{{ isPartner ? 'Yes' : 'No' }}</span>
            </div>
        </label>
    </div>
</template>