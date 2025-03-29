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
import { apiClient, type ResType } from '@api-client/index';

const apiPath = apiClient.dashboard.store[':storeId'].team.$get
type Member = ResType<typeof apiPath>["data"]["teamMembers"][0];

defineProps<{
    open: boolean;
    member: Member | null;
    isTransferring: boolean;
}>();

const emit = defineEmits(['update:open', 'confirm', 'cancel']);
</script>

<template>
    <Dialog :open="open"
            @update:open="emit('update:open', $event)">
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Transfer Ownership</DialogTitle>
                <DialogDescription>
                    Are you sure you want to transfer ownership to {{ member?.name }}?
                    You will no longer be the owner of this store.
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
                        :disabled="isTransferring">
                    Cancel
                </Button>
                <Button variant="destructive"
                        @click="emit('confirm')"
                        :disabled="isTransferring">
                    {{ isTransferring ? 'Transferring...' : 'Transfer Ownership' }}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>