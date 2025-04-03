import { apiClient } from '@api-client/index';
import type { User } from '@lib/types/UserType';
import { ref } from "vue";
import { toast } from '@/ui-plus/sonner';

export const userStore = ref<User | null>(null);

const whoamiCacheKey = "whoami-sessionStorage";

export const whoamiWithCache = async (): Promise<User | null> => {
    if (typeof window === "undefined") {
        const { data, error } = await (await apiClient.auth_global.whoami.$post()).json();
        if (error) {
            toast.error("Failed to fetch user data");
            return null;
        } else {
            return data;
        }
    }
    const cachedWhoami = sessionStorage.getItem(whoamiCacheKey);
    if (cachedWhoami) {
        const { data, timestamp } = JSON.parse(cachedWhoami) as { data: User | null, timestamp: number };
        if (Date.now() - timestamp < 600_000) { // 10 minutes
            return data;
        } else {
            clearWhoamiCache();
        }
    }
    const { data, error } = await (await apiClient.auth_global.whoami.$post()).json();
    if (error) {
        toast.error("Failed to fetch user data");
        return null;
    } else {
        sessionStorage.setItem(whoamiCacheKey, JSON.stringify({ data, timestamp: Date.now() }));
        return data;
    }
}

export const clearWhoamiCache = () => {
    if (typeof window === "undefined") {
        return;
    }
    sessionStorage.removeItem(whoamiCacheKey);
}

export const initializeUserStore = async () => {
    if (typeof window === "undefined") {
        return;
    }
    if (userStore.value !== null) {
        return;
    }
    const data = await whoamiWithCache();
    userStore.value = data;
}

export const logoutAll = async () => {
    const { error } = await (await apiClient.auth_global["logout-all"].$post()).json();
    if (error) {
        toast.error("Failed to logout");
    } else {
        userStore.value = null;
        clearWhoamiCache();
    }
}