<script setup lang="ts">
import { ref } from 'vue';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { currentWebsiteId } from '@src/stores/WebsiteStore';
import { apiClient } from '@api-client/index';
import { toast } from '@/ui-plus/sonner';
import { UserPlus } from 'lucide-vue-next';
import { TEAM_PERMISSIONS } from '@lib/consts';

const isOpen = ref(false);
const email = ref('');
const isSubmitting = ref(false);
const error = ref('');

// Create reactive permission states based on TEAM_PERMISSIONS
const permissionStates = ref<Record<string, boolean>>({});


const resetForm = () => {
    email.value = '';
    error.value = '';
};

const handleSubmit = async () => {
    error.value = '';

    // Validate email
    if (!email.value || !email.value.includes('@')) {
        error.value = 'Please enter a valid email address';
        return;
    }

    // Validate at least one permission is selected
    const hasPermission = Object.values(permissionStates.value).some(value => value);
    if (!hasPermission) {
        error.value = 'Please select at least one permission';
        return;
    }

    // Collect selected permissions
    const permissions = Object.entries(permissionStates.value)
        .filter(([_, isSelected]) => isSelected)
        .map(([key]) => TEAM_PERMISSIONS[key as keyof typeof TEAM_PERMISSIONS]);

    isSubmitting.value = true;

    try {
        const response = await apiClient.dashboard.website[':websiteId'].team_invite.$post({
            param: {
                websiteId: currentWebsiteId.value ?? ''
            },
            json: {
                email: email.value,
                permissions
            }
        });

        const { error: apiError } = await response.json();

        if (apiError) {
            error.value = apiError.message || 'Failed to send invitation';
            toast.error(error.value);
        } else {
            toast.success('Team invitation sent successfully');
            isOpen.value = false;
            resetForm();
        }
    } catch (e) {
        error.value = 'An error occurred while sending the invitation';
        toast.error(error.value);
    } finally {
        isSubmitting.value = false;
    }
};

// Reset form when dialog closes
const onDialogChange = (open: boolean) => {
    if (!open) {
        resetForm();
    }
};
</script>

<template>
    <Dialog v-model:open="isOpen"
            @update:open="onDialogChange">
        <DialogTrigger as-child>
            <Button class="flex items-center gap-2">
                <UserPlus class="h-4 w-4" />
                Invite Team Member
            </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
            </DialogHeader>

            <form @submit.prevent="handleSubmit"
                  class="space-y-4 mt-4">
                <div class="space-y-2">
                    <Label for="email">Email</Label>
                    <Input id="email"
                           v-model="email"
                           placeholder="colleague@example.com"
                           type="email"
                           required />
                </div>

                <div class="space-y-2">
                    <Label>Permissions</Label>
                    <div class="space-y-2">
                        <div v-for="(_value, key) in TEAM_PERMISSIONS"
                             :key="key"
                             class="flex items-center space-x-2">
                            <Checkbox :id="key"
                                      v-model:checked="permissionStates[key]" />
                            <Label :for="key"
                                   class="cursor-pointer">
                                {{ key }}
                            </Label>
                        </div>
                    </div>
                </div>

                <div v-if="error"
                     class="text-destructive text-sm">
                    {{ error }}
                </div>

                <DialogFooter class="mt-6">
                    <Button type="submit"
                            :disabled="isSubmitting"
                            :class="{ 'opacity-70 cursor-not-allowed': isSubmitting }">
                        {{ isSubmitting ? 'Sending...' : 'Send Invitation' }}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
</template>