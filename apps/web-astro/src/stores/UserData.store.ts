import { apiClient } from "@api-client/index";
import { ref, watch } from "vue";
import type { ResType } from "@api-client/index";
import { toast } from "@/ui-plus/sonner";

export type UserDataStoreType = ResType<typeof apiClient.auth_global.get_user_data.$post>["data"];

export const userDataStore = ref<UserDataStoreType>({
    user: null,
    userData: null,
});

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
    data?.userData?.addressArray?.forEach(address => {
        console.log(address.addressId);
    });
    watch(userDataStore, (newVal) => {
        saveUserData(newVal);
    }, { deep: true, immediate: false });
}

const saveUserData = async (newVal: UserDataStoreType) => {
    if (!newVal) return;
    const { data, error } = await (await apiClient.auth_global.update_user_data.$patch({
        json: {
            ...newVal.userData,
            // @ts-ignore
            hello: "world",
        }
    })).json();
    if (error) {
        console.error(error);
        toast.error("Failed to save user data");
    }
    console.log(data);
}

loadUserData();

export const logoutAll = async () => {
    const { error } = await (await apiClient.auth_global["logout-all"].$post()).json();
    if (error) {
        console.error(error);
        toast.error("Failed to logout");
    }
    userDataStore.value = {
        user: null,
        userData: null,
    };
}