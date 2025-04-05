import { authGlobalApiClient } from "@api-client/auth_global";
import type { ResType } from "@api-client/typeUtils";
import { ref } from 'vue'

export type User = ResType<Awaited<typeof authGlobalApiClient['whoami']['$post']>>['data'];
export const userStore = ref<User | null>(null)

export async function refreshUserData() {
    const { data, error } = await (await authGlobalApiClient.whoami.$post()).json();
    if (error) {
        console.error(error);
        userStore.value = null
    } else {
        userStore.value = data
    }
}