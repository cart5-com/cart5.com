<script setup lang="ts">
import { onMounted, ref } from 'vue';
import TeamMembersList from './TeamMembersList.vue';
import InviteTeamMemberDialog from './InviteTeamMemberDialog.vue';
import { currentWebsiteId } from '@src/stores/WebsiteStore';
import { dashboardApiClient } from '@src/lib/dashboardApiClient';
import { toast } from '@/ui-plus/sonner';
import { pageTitle } from '@src/stores/layout.store';
import { Loader2 } from 'lucide-vue-next';
import { type ResType } from '@api-client/ecomApiClient';
// Set page title
pageTitle.value = 'Team Management';

const apiPath = dashboardApiClient.api_dashboard.website[':websiteId'].team.$get
type Member = ResType<
    typeof apiPath
>["data"];

const members = ref<Member>([]);
const loading = ref(true);
const errorBanner = ref<string | null>(null);

const loadData = async () => {
    const { data, error } = await (await dashboardApiClient.api_dashboard.website[':websiteId'].team.$get({
        param: {
            websiteId: currentWebsiteId.value ?? ''
        }
    })).json();
    if (error) {
        console.error(error)
        errorBanner.value = error.message || 'Failed to load team members';
        toast.error(errorBanner.value);
    } else {
        members.value = data;
    }
    loading.value = false;
};

// Ensure we have the latest website data
onMounted(() => {
    loadData();
});

</script>

<template>
    <div class="container mx-auto px-4 py-8">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">Team Management</h1>
            <InviteTeamMemberDialog />
        </div>

        <div v-if="loading"
             class="flex justify-center py-8">
            <Loader2 class="h-8 w-8 animate-spin" />
        </div>

        <div v-else-if="errorBanner"
             class="bg-destructive/15 text-destructive border border-destructive/30 px-4 py-3 rounded mb-6">
            <p>{{ errorBanner }}</p>
        </div>

        <div v-else>
            <TeamMembersList :members="members" />
        </div>
    </div>
</template>
