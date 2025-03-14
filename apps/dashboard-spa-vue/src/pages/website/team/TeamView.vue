<script setup lang="ts">
import { onMounted, ref } from 'vue';
import TeamMembersList from './TeamMembersList.vue';
import { currentWebsiteId } from '@src/stores/WebsiteStore';
import { dashboardApiClient } from '@src/lib/dashboardApiClient';
import { toast } from '@/ui-plus/sonner';
import { pageTitle } from '@src/stores/layout.store';
import { Loader2, Mail, UserPlus } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Set page title
pageTitle.value = 'Team Management';

// Data for team members
const members = ref<any[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Dialog states
const isInviteDialogOpen = ref(false);
const isEditDialogOpen = ref(false);
const isRemoveDialogOpen = ref(false);
const selectedMember = ref<any | null>(null);
const inviteEmail = ref('');
const inviteRole = ref('MEMBER');
const editRole = ref('');
const processingAction = ref(false);

// Function to load data from API
const loadData = async () => {
    try {
        const response = await (await dashboardApiClient.api_dashboard.website[':websiteId'].team.$get({
            param: {
                websiteId: currentWebsiteId.value ?? ''
            }
        })).json();

        return response;
    } catch (err: any) {
        console.error('Error fetching team members:', err);
        return { data: null, error: err.message || 'Failed to load team members' };
    }
};

// Function to fetch team members
const fetchTeamMembers = async () => {
    if (!currentWebsiteId.value) {
        members.value = [];
        loading.value = false;
        return;
    }

    loading.value = true;
    error.value = null;

    try {
        const response = await loadData();

        if (response.data) {
            members.value = response.data;
        } else {
            error.value = response.error || 'Failed to load team members';
            toast.error('Failed to load team members');
        }
    } catch (err: any) {
        console.error('Error fetching team members:', err);
        error.value = err.message || 'Failed to load team members';
        toast.error('Failed to load team members');
    } finally {
        loading.value = false;
    }
};

// Handle invite member
const openInviteDialog = () => {
    inviteEmail.value = '';
    inviteRole.value = 'MEMBER';
    isInviteDialogOpen.value = true;
};

const sendInvite = async () => {
    if (!inviteEmail.value) {
        toast.error('Please enter an email address');
        return;
    }

    processingAction.value = true;

    try {
        // TODO: Send invitation to ${inviteEmail.value}
        toast.error(`TODO: Send invitation to ${inviteEmail.value}`);
        // toast.success(`Invitation sent to ${inviteEmail.value}`);
        isInviteDialogOpen.value = false;
        await fetchTeamMembers();
    } catch (err: any) {
        console.error('Error sending invitation:', err);
        toast.error(err.message || 'Failed to send invitation');
    } finally {
        processingAction.value = false;
    }
};

// Handle edit member
const openEditDialog = (member: any) => {
    selectedMember.value = member;

    if (member.isOwner) {
        editRole.value = 'OWNER';
    } else if (member.permissions.includes('FULL_ACCESS')) {
        editRole.value = 'ADMIN';
    } else if (member.permissions.includes('WEBSITE_MANAGER')) {
        editRole.value = 'MANAGER';
    } else {
        editRole.value = 'MEMBER';
    }

    isEditDialogOpen.value = true;
};

const updateMember = async () => {
    if (!selectedMember.value) return;

    processingAction.value = true;

    try {
        // TODO: Update role for ${selectedMember.value.email}
        toast.error(`TODO: Update role for ${selectedMember.value.email}`);
        // toast.success(`Updated role for ${selectedMember.value.email}`);
        isEditDialogOpen.value = false;
        await fetchTeamMembers();
    } catch (err: any) {
        console.error('Error updating member:', err);
        toast.error(err.message || 'Failed to update member');
    } finally {
        processingAction.value = false;
    }
};

// Handle remove member
const openRemoveDialog = (member: any) => {
    selectedMember.value = member;
    isRemoveDialogOpen.value = true;
};

const removeMember = async () => {
    if (!selectedMember.value) return;

    processingAction.value = true;

    try {
        // TODO: Remove ${selectedMember.value.email} from team
        toast.error(`TODO: Remove ${selectedMember.value.email} from team`);
        // toast.success(`Removed ${selectedMember.value.email} from team`);
        isRemoveDialogOpen.value = false;
        await fetchTeamMembers();
    } catch (err: any) {
        console.error('Error removing member:', err);
        toast.error(err.message || 'Failed to remove member');
    } finally {
        processingAction.value = false;
    }
};

// Ensure we have the latest website data
onMounted(() => {
    fetchTeamMembers();
});

</script>

<template>
    <div class="container mx-auto px-4 py-8">
        <div class="mb-6">
            <h1 class="text-2xl font-bold">Team Members</h1>
            <p class="text-gray-600">Manage your website team members</p>
        </div>

        <div v-if="loading"
             class="flex justify-center py-8">
            <Loader2 class="h-8 w-8 animate-spin" />
        </div>

        <div v-else-if="error"
             class="bg-destructive/15 text-destructive border border-destructive/30 px-4 py-3 rounded mb-6">
            <p>{{ error }}</p>
        </div>

        <div v-else>
            <TeamMembersList :members="members"
                             :loading="loading"
                             :error="error"
                             @invite="openInviteDialog"
                             @edit="openEditDialog"
                             @remove="openRemoveDialog" />
        </div>

        <!-- Invite Member Dialog -->
        <Dialog :open="isInviteDialogOpen"
                @update:open="isInviteDialogOpen = $event">
            <DialogContent class="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                        Send an invitation to join your website team.
                    </DialogDescription>
                </DialogHeader>
                <div class="grid gap-4 py-4">
                    <div class="grid gap-2">
                        <Label for="email">Email Address</Label>
                        <div class="flex items-center gap-2">
                            <Mail class="h-4 w-4 text-muted-foreground" />
                            <Input id="email"
                                   v-model="inviteEmail"
                                   placeholder="email@example.com"
                                   type="email" />
                        </div>
                    </div>
                    <div class="grid gap-2">
                        <Label for="role">Role</Label>
                        <Select v-model="inviteRole">
                            <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MEMBER">Member</SelectItem>
                                <SelectItem value="MANAGER">Manager</SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline"
                            @click="isInviteDialogOpen = false">Cancel</Button>
                    <Button type="submit"
                            @click="sendInvite"
                            :disabled="processingAction">
                        <UserPlus v-if="!processingAction"
                                  class="h-4 w-4 mr-2" />
                        <Loader2 v-else
                                 class="h-4 w-4 mr-2 animate-spin" />
                        Send Invitation
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <!-- Edit Member Dialog -->
        <Dialog :open="isEditDialogOpen"
                @update:open="isEditDialogOpen = $event">
            <DialogContent class="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Team Member</DialogTitle>
                    <DialogDescription>
                        Update role for {{ selectedMember?.email }}
                    </DialogDescription>
                </DialogHeader>
                <div class="grid gap-4 py-4">
                    <div class="grid gap-2">
                        <Label for="edit-role">Role</Label>
                        <Select v-model="editRole">
                            <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MEMBER">Member</SelectItem>
                                <SelectItem value="MANAGER">Manager</SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline"
                            @click="isEditDialogOpen = false">Cancel</Button>
                    <Button type="submit"
                            @click="updateMember"
                            :disabled="processingAction">
                        <Loader2 v-if="processingAction"
                                 class="h-4 w-4 mr-2 animate-spin" />
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <!-- Remove Member Alert Dialog -->
        <AlertDialog :open="isRemoveDialogOpen"
                     @update:open="isRemoveDialogOpen = $event">
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to remove {{ selectedMember?.email }} from your team?
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel @click="isRemoveDialogOpen = false">Cancel</AlertDialogCancel>
                    <AlertDialogAction @click="removeMember"
                                       class="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        <Loader2 v-if="processingAction"
                                 class="h-4 w-4 mr-2 animate-spin" />
                        Remove
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
</template>
