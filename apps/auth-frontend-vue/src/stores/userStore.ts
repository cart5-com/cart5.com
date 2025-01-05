import { getAuthApiClient } from "@src/lib/authApiClient";
import { type User } from "lib/apiClients/authApiClient";
import { atom } from 'nanostores'

export const $userStore = atom<User | null>(null);

export const refreshUserData = async () => {
    const { data, error } = await (await getAuthApiClient().api.user.whoami.$post()).json();
    if (error) {
        console.error(error);
        $userStore.set(null);
    } else {
        $userStore.set(data);
    }
}