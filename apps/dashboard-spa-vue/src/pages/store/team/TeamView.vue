<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { currentStoreId } from '@dashboard-spa-vue/stores/StoreStore';
import { apiClient } from '@api-client/index';
import { toast } from '@/ui-plus/sonner';
import { pageTitle } from '@dashboard-spa-vue/stores/layout.store';
import { Loader2 } from 'lucide-vue-next';
import { type ResType } from '@api-client/index';
import TeamMembersList from './TeamMembersList.vue';
import InvitationsList from './InvitationsList.vue';
import InviteTeamMemberDialog from './InviteTeamMemberDialog.vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Set page title
pageTitle.value = 'Store Team Management';

const membersApiPath = apiClient.dashboard.store[':storeId'].team.$get;
type Member = ResType<typeof membersApiPath>["data"]["teamMembers"];
type SupportTeamWebsite = ResType<typeof membersApiPath>["data"]["supportTeamWebsite"];

const invitationsApiPath = apiClient.dashboard.store[':storeId'].team_invitations.$get;
type Invitation = ResType<typeof invitationsApiPath>["data"];

const members = ref<Member>([]);
const supportTeamWebsite = ref<SupportTeamWebsite | null>(null);
const invitations = ref<Invitation>([]);
const loading = ref(true);
const errorBanner = ref<string | null>(null);

const loadData = async () => {
    loading.value = true;
    errorBanner.value = null;

    try {
        // Load team members
        const membersRes = await (await apiClient.dashboard.store[':storeId'].team.$get({
            param: {
                storeId: currentStoreId.value ?? ''
            }
        })).json();

        if (membersRes.error) {
            console.error(membersRes.error);
            errorBanner.value = membersRes.error.message || 'Failed to load team members';
            toast.error(errorBanner.value);
        } else {
            members.value = membersRes.data.teamMembers;
            supportTeamWebsite.value = membersRes.data.supportTeamWebsite;
        }

        const invitationsRes = await (await apiClient.dashboard.store[':storeId'].team_invitations.$get({
            param: {
                storeId: currentStoreId.value ?? ''
            }
        })).json();

        if (invitationsRes.error) {
            console.error(invitationsRes.error);
            // Don't override the error banner if we already have one
            if (!errorBanner.value) {
                errorBanner.value = invitationsRes.error.message || 'Failed to load invitations';
                toast.error(errorBanner.value);
            }
        } else {
            invitations.value = invitationsRes.data;
        }
    } catch (e) {
        console.error(e);
        errorBanner.value = 'An error occurred while loading team data';
        toast.error(errorBanner.value);
    } finally {
        loading.value = false;
    }
};

// Ensure we have the latest store data
onMounted(() => {
    loadData();
});

</script>

<template>
    <div class="container mx-auto px-4 py-8">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">Store Team Management</h1>
            <InviteTeamMemberDialog @invitation-sent="loadData" />
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
            <Card v-if="supportTeamWebsite"
                  class="max-w-lg mx-auto mb-6">
                <CardHeader>
                    <CardTitle>
                        Support Team
                        <Badge variant="secondary">
                            {{ supportTeamWebsite?.name }}
                            ({{ supportTeamWebsite?.defaultHostname }})
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p>This team can access your store to give your team support.</p>
                </CardContent>
            </Card>
            <TeamMembersList :members="members"
                             @ownership-transferred="loadData"
                             @member-removed="loadData"
                             @team-updated="loadData" />
            <InvitationsList :invitations="invitations"
                             @invitation-cancelled="loadData" />
        </div>
    </div>
</template>
