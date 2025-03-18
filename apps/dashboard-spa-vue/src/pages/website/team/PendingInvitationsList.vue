<script setup lang="ts">
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Clock, User } from 'lucide-vue-next';
import { apiClient } from '@api-client/index';
import { type ResType } from '@api-client/index';
import { formatDate } from '@lib/utils/formatDate';

const apiPath = apiClient.dashboard.website[':websiteId'].team_invitations.$get;
type Invitation = ResType<typeof apiPath>["data"][0];

defineProps<{
    invitations: Invitation[];
}>();

// Format timestamp to relative time (e.g., 2 hours ago)
const formatTime = (timestamp: number) => {
    return formatDate(timestamp);
};

// Format permissions list to be more readable
const formatPermissions = (permissions: string[]) => {
    return permissions.map(p => p.replace(/_/g, ' ')).join(', ');
};
</script>

<template>
    <Card class="max-w-lg mx-auto mt-6">
        <CardHeader class="pb-2">
            <h3 class="text-lg font-medium">Pending Invitations</h3>
            <p class="text-sm text-muted-foreground">
                These invitations are waiting for users to accept
            </p>
        </CardHeader>
        <CardContent>
            <div v-if="invitations.length === 0"
                 class="text-center py-4 text-muted-foreground">
                No pending invitations
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

                    <div class="text-sm">
                        <span class="text-muted-foreground">Permissions:</span>
                        <span class="ml-1">{{ formatPermissions(invitation.permissions ?? []) }}</span>
                    </div>

                    <!-- Add buttons for resend/cancel if needed -->
                    <!-- <div class="flex gap-2 mt-3">
            <Button variant="outline" size="sm">Resend</Button>
            <Button variant="destructive" size="sm">Cancel</Button>
          </div> -->
                </div>
            </div>
        </CardContent>
    </Card>
</template>