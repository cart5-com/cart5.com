import { authApiClient, type User } from "@root/lib/authApiClient";
import { atom } from 'nanostores'

export const $userStore = atom<User | null>(null);
export const $isUserReady = atom<boolean>(false);

const getUserData = async () => {
    if (typeof sessionStorage !== "undefined") {
        const userData = sessionStorage.getItem("user");
        if (userData) {
            const { user, date } = JSON.parse(userData);
            if (Date.now() - date < 300_000) {
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
        sessionStorage.removeItem("user");
    }
}

export const saveUserToSession = (user: User | null) => {
    if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem("user", JSON.stringify({
            user,
            date: Date.now()
        }));
    }
}


export const waitUntilUserReady = async () => {
    if ($isUserReady.get()) {
        return;
    } else {
        return new Promise<void>(resolve => {
            let unsubscribe: () => void;
            unsubscribe = $isUserReady.subscribe(ready => {
                if (ready) {
                    unsubscribe();
                    resolve();
                }
            });
        });
    }
}

