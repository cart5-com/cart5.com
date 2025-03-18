<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from 'vue';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { TEAM_PERMISSIONS } from '@lib/consts';
import { apiClient, type ResType } from '@api-client/index';

const apiPath = apiClient.dashboard.website[':websiteId'].team.$get
type Member = ResType<typeof apiPath>["data"][0];

const props = defineProps<{
    open: boolean;
    member: Member | null;
    isUpdating: boolean;
}>();

const emit = defineEmits(['update:open', 'confirm', 'cancel']);

// Create reactive permission states based on TEAM_PERMISSIONS
const permissionStates = ref<Record<string, boolean>>({
    FULL_ACCESS: false,
    WEBSITE_MANAGER: false,
    TEAM_MANAGER: false,
    RESTAURANT_MANAGER: false
});

const error = ref('');

// Reset form when dialog opens with a member
watch(() => [props.open, props.member], () => {
    if (props.open && props.member) {
        // Reset all permissions to false
        Object.keys(permissionStates.value).forEach(key => {
            permissionStates.value[key] = false;
        });

        // Set selected permissions based on member's current permissions
        if (props.member.permissions && Array.isArray(props.member.permissions)) {
            props.member.permissions.forEach(permission => {
                const key = Object.keys(TEAM_PERMISSIONS).find(
                    k => TEAM_PERMISSIONS[k as keyof typeof TEAM_PERMISSIONS] === permission
                );
                if (key) {
                    permissionStates.value[key] = true;
                }
            });
        }
        error.value = '';
    }
}, { immediate: true });

const handleConfirm = () => {
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

    emit('confirm', permissions);
};

const handleCancel = () => {
    emit('cancel');
};

const updateOpen = (value: boolean) => {
    emit('update:open', value);
};
</script>

<template>
    <Dialog :open="open"
            @update:open="updateOpen">
        <DialogContent class="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Edit Permissions</DialogTitle>
            </DialogHeader>

            <div v-if="member"
                 class="mt-4">
                <p class="text-sm mb-4">
                    Update permissions for <strong>{{ member.name || member.email }}</strong>
                </p>

                <div class="space-y-2 mt-4">
                    <Label>Permissions</Label>
                    <div class="space-y-2">
                        <div v-for="(_value, key) in TEAM_PERMISSIONS"
                             :key="key"
                             class="flex items-center space-x-2">
                            <Checkbox :id="`edit-${key}`"
                                      v-model:checked="permissionStates[key]" />
                            <Label :for="`edit-${key}`"
                                   class="cursor-pointer">
                                {{ key }}
                            </Label>
                        </div>
                    </div>
                </div>

                <div v-if="error"
                     class="text-destructive text-sm mt-2">
                    {{ error }}
                </div>
            </div>

            <DialogFooter class="mt-6">
                <Button variant="outline"
                        @click="handleCancel"
                        :disabled="isUpdating">
                    Cancel
                </Button>
                <Button @click="handleConfirm"
                        :disabled="isUpdating">
                    {{ isUpdating ? 'Updating...' : 'Update Permissions' }}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>