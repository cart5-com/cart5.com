<script setup lang="ts">
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Clock, User, X } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { dashboardApiClient } from '@api-client/dashboard';
import type { ResType } from "@api-client/typeUtils";
import { formatDate } from '@lib/utils/formatDate';
import { ref } from 'vue';
import { currentWebsiteId } from '@dashboard-spa-vue/stores/MyWebsitesStore';
import { toast } from '@/ui-plus/sonner';

const apiPath = dashboardApiClient.website[':websiteId'].team_invitations.$get;
type Invitation = ResType<typeof apiPath>["data"][0];

defineProps<{
    invitations: Invitation[];
}>();

const emit = defineEmits(['invitation-cancelled']);

// Track which invitations are being cancelled
const cancellingInvitations = ref<Record<string, boolean>>({});

// Format timestamp to relative time (e.g., 2 hours ago)
const formatTime = (timestamp: number) => {
    return formatDate(timestamp);
};

// Format permissions list to be more readable
const formatPermissions = (permissions: string[]) => {
    return permissions.map(p => p.replace(/_/g, ' ')).join(', ');
};

// Cancel an invitation
const cancelInvitation = async (invitationId: string) => {
    if (cancellingInvitations.value[invitationId]) return;

    cancellingInvitations.value[invitationId] = true;

    try {
        const response = await dashboardApiClient.website[':websiteId'].team_invite_cancel.$post({
            param: {
                websiteId: currentWebsiteId.value ?? ''
            },
            json: {
                invitationId
            }
        });

        const { error } = await response.json();

        if (error) {
            console.error(error);
            toast.error(error.message || 'Failed to cancel invitation');
        } else {
            toast.success('Invitation cancelled successfully');
            emit('invitation-cancelled');
        }
    } catch (e) {
        console.error(e);
        toast.error('An error occurred while cancelling the invitation');
    } finally {
        cancellingInvitations.value[invitationId] = false;
    }
};
</script>

<template>
    <Card class="max-w-lg mx-auto mt-6">
        <CardHeader class="pb-2">
            <h3 class="text-lg font-medium">Invitations</h3>
        </CardHeader>
        <CardContent>
            <div v-if="invitations.length === 0"
                 class="text-center py-4 text-muted-foreground">
                No invitations
            </div>
            <div v-else
                 class="space-y-4">
                <div v-for="invitation in invitations"
                     :key="invitation.id"
                     class="flex flex-col p-4 border rounded-lg">
                    <div class="flex items-center justify-between mb-2">
                        <div class="text-base font-medium flex items-center">
                            <Mail class="h-4 w-4 mr-2" />
                            {{ invitation.email }}
                        </div>
                        <Badge variant="outline"
                               :class="invitation.status === 'EXPIRED' ? 'text-destructive border-destructive/50' : ''"
                               class="ml-2">{{ invitation.status }}</Badge>
                    </div>

                    <div class="flex items-center text-sm text-muted-foreground mb-2">
                        <Clock class="h-3 w-3 mr-1" />
                        Invited {{ formatTime(invitation.createdAt) }}
                    </div>

                    <div class="flex items-center text-sm text-muted-foreground mb-3">
                        <User class="h-3 w-3 mr-1" />
                        Invited by {{ invitation.inviterName }}
                    </div>

                    <div class="text-sm mb-3">
                        <span class="text-muted-foreground">Permissions:</span>
                        <span class="ml-1">{{ formatPermissions(invitation.permissions ?? []) }}</span>
                    </div>

                    <div class="flex justify-end">
                        <Button v-if="invitation.status === 'PENDING'"
                                variant="destructive"
                                size="sm"
                                :disabled="cancellingInvitations[invitation.id]"
                                @click="cancelInvitation(invitation.id)"
                                class="flex items-center gap-1">
                            <X class="h-3.5 w-3.5" />
                            {{ cancellingInvitations[invitation.id] ? 'Cancelling...' : 'Cancel Invitation' }}
                        </Button>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
</template>