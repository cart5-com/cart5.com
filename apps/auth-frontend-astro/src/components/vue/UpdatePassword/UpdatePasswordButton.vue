<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue';
import { useDialog } from '@/ui-plus/dialog/use-dialog';
import UpdatePasswordForm from '@root/components/vue/UpdatePassword/UpdatePasswordForm.vue';
import { useStore } from '@nanostores/vue'
import { $userStore } from '@root/stores/userStore';
const user = useStore($userStore);
const dialog = useDialog();

function openDialog() {
    dialog.show({
        title: "Update Password",
        closeable: false,
        component: UpdatePasswordForm,
    });
}
</script>

<template>
    <Button @click="openDialog"
            :disabled="!user?.hasNewSession">
        Update Password
    </Button>
</template>