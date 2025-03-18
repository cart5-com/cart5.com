import { apiClient, type User } from "@api-client/index";
import { ref } from 'vue'

export const userStore = ref<User | null>(null)

export async function refreshUserData() {
    const { data, error } = await (await apiClient.auth_global.whoami.$post()).json();
    if (error) {
        console.error(error);
        userStore.value = null
    } else {
        userStore.value = data
    }
}