import { apiClient } from '@api-client/index';
import type { User } from '@lib/types/UserType';
import { ref } from "vue";
import { toast } from '@/ui-plus/sonner';

export const userStore = ref<User | null>(null);

export const initializeUserStore = async () => {
    if (typeof window === "undefined") {
        return;
    }
    if (userStore.value !== null) {
        return;
    }
    const { data, error } = await (await apiClient.auth_global.whoami.$post()).json();
    if (error) {
        toast.error("Failed to fetch user data");
    } else {
        userStore.value = data;
    }
}

export const logoutAll = async () => {
    const { error } = await (await apiClient.auth_global["logout-all"].$post()).json();
    if (error) {
        toast.error("Failed to logout");
    } else {
        userStore.value = null;
    }
}