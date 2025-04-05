<script setup lang="ts">
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Mail } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { dashboardApiClient } from '@api-client/dashboard';
import type { ResType } from '@api-client/typeUtils';

const apiPath = dashboardApiClient.dashboard.store[':storeId'].team.$get
type Member = ResType<typeof apiPath>["data"]["teamMembers"][0];

defineProps<{
    open: boolean;
    member: Member | null;
    isRemoving: boolean;
}>();

const emit = defineEmits(['update:open', 'confirm', 'cancel']);
</script>

<template>
    <Dialog :open="open"
            @update:open="emit('update:open', $event)">
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Remove Team Member</DialogTitle>
                <DialogDescription>
                    Are you sure you want to remove {{ member?.name }} from the team?
                    They will lose all access to this store.
                </DialogDescription>
            </DialogHeader>

            <div class="flex items-center p-4 border rounded-lg mt-4 mb-6">
                <Avatar class="h-10 w-10">
                    <AvatarImage v-if="member?.pictureUrl"
                                 :src="member.pictureUrl"
                                 alt="" />
                    <AvatarFallback class="bg-muted">
                        {{ member?.name?.slice(0, 4).toUpperCase() }}
                    </AvatarFallback>
                </Avatar>
                <div class="ml-4">
                    <div class="font-medium">
                        {{ member?.name || 'Unnamed User' }}
                    </div>
                    <div class="text-sm text-muted-foreground flex items-center mt-1">
                        <Mail class="h-3 w-3 mr-1" />
                        {{ member?.email }}
                    </div>
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline"
                        @click="emit('cancel')"
                        :disabled="isRemoving">
                    Cancel
                </Button>
                <Button variant="destructive"
                        @click="emit('confirm')"
                        :disabled="isRemoving">
                    {{ isRemoving ? 'Removing...' : 'Remove Member' }}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>