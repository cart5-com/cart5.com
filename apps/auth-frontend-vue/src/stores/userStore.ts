import { getAuthGlobalApiClient } from "@src/lib/authApiClient";
import { type User } from "@api-client/authApiClient";
import { ref } from 'vue'

export const userStore = ref<User | null>(null)

export async function refreshUserData() {
    const { data, error } = await (await getAuthGlobalApiClient().api_auth_global.whoami.$post()).json();
    if (error) {
        console.error(error);
        userStore.value = null
    } else {
        userStore.value = data
    }
}