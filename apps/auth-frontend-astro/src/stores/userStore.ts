import { USER_DATA_SESSION_EXPIRATION_TIME, USER_DATA_SESSION_KEY } from "@root/const";
import { authApiClient, type User } from "@root/lib/authApiClient";
import { atom } from 'nanostores'

export const $userStore = atom<User | null>(null);
export const $isUserReady = atom<boolean>(false);

const getUserData = async () => {
    if (typeof sessionStorage !== "undefined") {
        const userData = sessionStorage.getItem(USER_DATA_SESSION_KEY);
        if (userData) {
            const { user, date } = JSON.parse(userData);
            if (Date.now() - date < USER_DATA_SESSION_EXPIRATION_TIME) {
                $userStore.set(user);
                $isUserReady.set(true);
                return;
            }
        }
    }
    const { data, error } = await (await authApiClient.api.user.whoami.$post()).json();
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

getUserData();

export const removeUserFromSession = () => {
    if (typeof sessionStorage !== "undefined") {
        sessionStorage.removeItem(USER_DATA_SESSION_KEY);
    }
}

export const saveUserToSession = (user: User | null) => {
    if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem(USER_DATA_SESSION_KEY, JSON.stringify({
            user,
            date: Date.now()
        }));
    }
}