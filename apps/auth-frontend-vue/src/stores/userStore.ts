import { USER_DATA_SESSION_EXPIRATION_TIME, SESSION_STORAGE_KEYS } from "@src/const";
import { getAuthApiClient } from "@src/lib/authApiClient";
import { type User } from "lib/apiClients/authApiClient";
import { atom } from 'nanostores'

export const $userStore = atom<User | null>(null);
export const $isUserReady = atom<boolean>(false);

export const getUserData = async () => {
    if (typeof sessionStorage !== "undefined") {
        const userData = sessionStorage.getItem(SESSION_STORAGE_KEYS.USER_DATA);
        if (userData) {
            const { user, date } = JSON.parse(userData);
            if (Date.now() - date < USER_DATA_SESSION_EXPIRATION_TIME) {
                $userStore.set(user);
                $isUserReady.set(true);
                return;
            }
        }
    }
    const { data, error } = await (await getAuthApiClient().api.user.whoami.$post()).json();
    if (error) {
        console.error(error);
        $userStore.set(null);
        $isUserReady.set(true);
    } else {
        saveUserToSession(data);
        $userStore.set(data);
        $isUserReady.set(true);
    }
};

export const refreshUserData = async () => {
    removeUserFromSession();
    await getUserData();
}
export const removeUserFromSession = () => {
    if (typeof sessionStorage !== "undefined") {
        sessionStorage.removeItem(SESSION_STORAGE_KEYS.USER_DATA);
    }
}

export const saveUserToSession = (user: User | null) => {
    if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem(SESSION_STORAGE_KEYS.USER_DATA, JSON.stringify({
            user,
            date: Date.now()
        }));
    }
}