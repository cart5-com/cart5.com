<script setup lang="ts">
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Mail, Shield, Crown } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { apiClient } from '@api-client/index';
import { type ResType } from '@api-client/index';
import { currentWebsiteId } from '@src/stores/WebsiteStore';
import { toast } from '@/ui-plus/sonner';
import { ref, computed } from 'vue';

const apiPath = apiClient.dashboard.website[':websiteId'].team.$get
type Member = ResType<typeof apiPath>["data"][0];

const props = defineProps<{
    members: Array<Member>;
}>();

const emit = defineEmits(['ownership-transferred']);

const isTransferOwnershipDialogOpen = ref(false);
const selectedMember = ref<Member | null>(null);
const isTransferring = ref(false);

// Get the current user's ID from the members
const currentUserMember = computed(() =>
    props.members.find(member => member.isOwner)
);

const showTransferDialog = (member: Member) => {
    selectedMember.value = member;
    isTransferOwnershipDialogOpen.value = true;
};

const transferOwnership = async () => {
    if (!selectedMember.value) return;

    isTransferring.value = true;

    try {
        const response = await apiClient.dashboard.website[':websiteId'].team_transfer_ownership.$post({
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
</script>

<template>
    <Card class="max-w-lg mx-auto">
        <CardHeader class="pb-2">
            <p class="text-sm text-muted-foreground">Team members can access and manage this website based on their
                permissions</p>
        </CardHeader>
        <CardContent>
            <div class="space-y-4">
                <div v-for="member in members"
                     :key="member.userId"
                     class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg">
                    <div class="flex items-center mb-3 sm:mb-0">
                        <Avatar class="h-10 w-10">
                            <AvatarImage v-if="member.pictureUrl"
                                         :src="member.pictureUrl"
                                         alt="" />
                            <AvatarFallback class="bg-muted">
                                {{ member.name?.slice(0, 4).toUpperCase() }}
                            </AvatarFallback>
                        </Avatar>
                        <div class="ml-4">
                            <div class="font-medium">
                                {{ member.name || 'Unnamed User' }}
                            </div>
                            <div class="text-sm text-muted-foreground flex items-center mt-1">
                                <Mail class="h-3 w-3 mr-1" />
                                {{ member.email }}
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                        <div class="ml-14 sm:ml-0 flex gap-2 items-center">
                            <Badge v-if="member.isOwner"
                                   variant="default"
                                   class="bg-primary/20 text-primary hover:bg-primary/20">
                                <Shield class="h-3 w-3 mr-1" />
                                Owner
                            </Badge>

                            <!-- Transfer ownership button (only visible to current owner and not for self) -->
                            <Button v-if="currentUserMember?.isOwner && !member.isOwner"
                                    variant="outline"
                                    size="sm"
                                    @click="showTransferDialog(member)"
                                    class="flex items-center gap-1 text-xs">
                                <Crown class="h-3 w-3" />
                                Make Owner
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>

    <!-- Transfer Ownership Dialog -->
    <Dialog v-model:open="isTransferOwnershipDialogOpen">
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Transfer Ownership</DialogTitle>
                <DialogDescription>
                    Are you sure you want to transfer ownership to {{ selectedMember?.name }}?
                    You will no longer be the owner of this team.
                </DialogDescription>
            </DialogHeader>

            <div class="flex items-center p-4 border rounded-lg mt-4 mb-6">
                <Avatar class="h-10 w-10">
                    <AvatarImage v-if="selectedMember?.pictureUrl"
                                 :src="selectedMember.pictureUrl"
                                 alt="" />
                    <AvatarFallback class="bg-muted">
                        {{ selectedMember?.name?.slice(0, 4).toUpperCase() }}
                    </AvatarFallback>
                </Avatar>
                <div class="ml-4">
                    <div class="font-medium">
                        {{ selectedMember?.name || 'Unnamed User' }}
                    </div>
                    <div class="text-sm text-muted-foreground flex items-center mt-1">
                        <Mail class="h-3 w-3 mr-1" />
                        {{ selectedMember?.email }}
                    </div>
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline"
                        @click="isTransferOwnershipDialogOpen = false"
                        :disabled="isTransferring">
                    Cancel
                </Button>
                <Button variant="destructive"
                        @click="transferOwnership"
                        :disabled="isTransferring">
                    {{ isTransferring ? 'Transferring...' : 'Transfer Ownership' }}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>
