import { getAuthApiClient } from "@src/lib/authApiClient";
import { type User } from "lib/hono/apiClients/authApiClient";
import { ref } from 'vue'

export const userStore = ref<User | null>(null)

export async function refreshUserData() {
    const { data, error } = await (await getAuthApiClient().api_auth.user.whoami.$post()).json();
    if (error) {
        console.error(error);
        userStore.value = null
    } else {
        userStore.value = data
    }
}