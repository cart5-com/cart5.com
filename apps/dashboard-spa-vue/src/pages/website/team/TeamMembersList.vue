<script setup lang="ts">
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ref, computed } from 'vue';
import { dashboardApiClient } from '@api-client/dashboard';
import type { ResType } from "@api-client/typeUtils";
import { currentWebsite, currentWebsiteId } from '@dashboard-spa-vue/stores/MyWebsitesStore';
import TeamMemberItem from './components/TeamMemberItem.vue';
import TransferOwnershipDialog from './components/TransferOwnershipDialog.vue';
import RemoveMemberDialog from './components/RemoveMemberDialog.vue';
import EditPermissionsDialog from './components/EditPermissionsDialog.vue';
import { toast } from '@/ui-plus/sonner';
import { Globe, TriangleAlert } from 'lucide-vue-next';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const apiPath = dashboardApiClient.dashboard.website[':websiteId'].team.$get
type Member = ResType<typeof apiPath>["data"]["teamMembers"][0];

const props = defineProps<{
    members: Array<Member>;
}>();

const emit = defineEmits(['ownership-transferred', 'member-removed', 'team-updated']);

const isTransferOwnershipDialogOpen = ref(false);
const isRemoveMemberDialogOpen = ref(false);
const isEditPermissionsDialogOpen = ref(false);
const selectedMember = ref<Member | null>(null);
const isTransferring = ref(false);
const isRemoving = ref(false);
const isUpdatingPermissions = ref(false);

// Get the current user's ID from the members
const currentUserMember = computed(() =>
    props.members.find(member => member.isOwner)
);

// Current user ID
const currentUserId = computed(() =>
    currentUserMember.value?.userId
);

// Check if current user has permission to manage team members
const canManageTeam = computed(() => {
    const member = props.members.find(m => m.userId === currentUserId.value);
    // Owner or member with TEAM_MANAGER permission can manage team
    return member?.isOwner ||
        (member?.permissions?.includes('TEAM_MANAGER') ||
            member?.permissions?.includes('FULL_ACCESS'));
});

const showTransferDialog = (member: Member) => {
    selectedMember.value = member;
    isTransferOwnershipDialogOpen.value = true;
};

const showRemoveDialog = (member: Member) => {
    selectedMember.value = member;
    isRemoveMemberDialogOpen.value = true;
};

const showEditPermissionsDialog = (member: Member) => {
    selectedMember.value = member;
    isEditPermissionsDialogOpen.value = true;
};

const transferOwnership = async () => {
    if (!selectedMember.value) return;

    isTransferring.value = true;

    try {
        const response = await dashboardApiClient.dashboard.website[':websiteId'].team_transfer_ownership.$post({
            param: {
                websiteId: currentWebsiteId.value ?? ''
            },
            json: {
                newOwnerId: selectedMember.value.userId
            }
        });

        const { error } = await response.json();

        if (error) {
            console.error(error);
            toast.error(error.message || 'Failed to transfer ownership');
        } else {
            toast.success('Ownership transferred successfully');
            isTransferOwnershipDialogOpen.value = false;
            emit('ownership-transferred');
        }
    } catch (e) {
        console.error(e);
        toast.error('An error occurred while transferring ownership');
    } finally {
        isTransferring.value = false;
    }
};

const removeMember = async () => {
    if (!selectedMember.value) return;

    isRemoving.value = true;

    try {
        const response = await dashboardApiClient.dashboard.website[':websiteId'].team_remove_member.$post({
            param: {
                websiteId: currentWebsiteId.value ?? ''
            },
            json: {
                memberId: selectedMember.value.userId
            }
        });

        const { error } = await response.json();

        if (error) {
            console.error(error);
            toast.error(error.message || 'Failed to remove team member');
        } else {
            toast.success('Team member removed successfully');
            isRemoveMemberDialogOpen.value = false;
            emit('member-removed');
        }
    } catch (e) {
        console.error(e);
        toast.error('An error occurred while removing the team member');
    } finally {
        isRemoving.value = false;
    }
};

const updatePermissions = async (permissions: string[]) => {
    if (!selectedMember.value) return;

    isUpdatingPermissions.value = true;

    try {
        const { error } = await (await dashboardApiClient.dashboard.website[':websiteId'].team_update_permissions.$post({
            param: {
                websiteId: currentWebsiteId.value ?? ''
            },
            json: {
                memberId: selectedMember.value.userId,
                permissions
            }
        })).json();

        if (error) {
            console.error(error);
            toast.error(error.message || 'Failed to update permissions');
        } else {
            toast.success('Permissions updated successfully');
            isEditPermissionsDialogOpen.value = false;
            emit('team-updated');
        }
    } catch (e) {
        console.error(e);
        toast.error('An error occurred while updating permissions');
    } finally {
        isUpdatingPermissions.value = false;
    }
};
</script>

<template>
    <Card class="max-w-lg mx-auto">
        <CardHeader class="pb-2">
            <p class="text-sm text-muted-foreground">
                <Globe class="inline-block mr-1" />
                <strong>Website:</strong> <span class="font-medium">{{ currentWebsite?.name }}</span>
                <span class="text-muted-foreground ml-1">({{ currentWebsite?.defaultHostname }})</span>
                <br>
                <span class="mt-1 block">Team members can access and manage this website based on their assigned
                    permissions.</span>
            </p>
        </CardHeader>
        <CardContent>
            <div class="space-y-4">
                <Alert v-if="members.length === 0">
                    <TriangleAlert />
                    <AlertTitle>Heads up!</AlertTitle>
                    <AlertDescription>
                        The first member of the team will be the owner of the store.
                        owner can transfer ownership to another member. but no other member can transfer ownership to
                        another member.
                    </AlertDescription>
                </Alert>
                <TeamMemberItem v-for="member in members"
                                :key="member.userId"
                                :member="member"
                                :is-current-user="member.userId === currentUserId"
                                :can-manage-team="canManageTeam ?? false"
                                :is-owner="currentUserMember?.isOwner ?? false"
                                @transfer-ownership="showTransferDialog"
                                @remove-member="showRemoveDialog"
                                @edit-permissions="showEditPermissionsDialog" />
            </div>
        </CardContent>
    </Card>

    <!-- Transfer Ownership Dialog -->
    <TransferOwnershipDialog v-model:open="isTransferOwnershipDialogOpen"
                             :member="selectedMember"
                             :is-transferring="isTransferring"
                             @confirm="transferOwnership"
                             @cancel="isTransferOwnershipDialogOpen = false" />

    <!-- Remove Member Dialog -->
    <RemoveMemberDialog v-model:open="isRemoveMemberDialogOpen"
                        :member="selectedMember"
                        :is-removing="isRemoving"
                        @confirm="removeMember"
                        @cancel="isRemoveMemberDialogOpen = false" />

    <!-- Edit Permissions Dialog -->
    <EditPermissionsDialog v-model:open="isEditPermissionsDialogOpen"
                           :member="selectedMember"
                           :is-updating="isUpdatingPermissions"
                           @confirm="updatePermissions"
                           @cancel="isEditPermissionsDialogOpen = false" />
</template>
