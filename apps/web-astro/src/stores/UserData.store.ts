import { apiClient } from "@api-client/index";
import { ref, watch } from "vue";
import type { ResType } from "@api-client/index";
import { toast } from "@/ui-plus/sonner";

export type UserDataStoreType = ResType<typeof apiClient.auth_global.get_user_data.$post>["data"];

export const userDataStore = ref<UserDataStoreType>(null);

const loadUserData = async () => {
    if (import.meta.env.SSR) return;
    const { data, error } = await (await apiClient.auth_global.get_user_data.$post({
        json: {
            columns: {
                rememberLastAddressId: true,
                addresses: true,
            }
        }
    })).json();
    if (error) {
        console.error(error);
        toast.error("Failed to load user data");
    }
    userDataStore.value = data;
    data?.addressArray?.forEach(address => {
        console.log(address.addressId);
    });
    watch(userDataStore, (newVal) => {
        saveUserData(newVal);
    }, { deep: true });
}

const saveUserData = async (newVal: UserDataStoreType) => {
    if (!newVal) return;
    const { data, error } = await (await apiClient.auth_global.update_user_data.$patch({
        json: newVal
    })).json();
    if (error) {
        console.error(error);
        toast.error("Failed to save user data");
    }
    console.log(data);
}

loadUserData();