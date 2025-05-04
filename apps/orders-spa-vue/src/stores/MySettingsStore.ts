import { ref, watch } from 'vue';

export type listeningStoresType = {
    storeId: string;
    isEnabled: boolean;
}

// record of storeId to isEnabled
export const listeningStores = ref<Record<string, listeningStoresType>>({});

export const addListeningStore = (storeId: string) => {
    if (!listeningStores.value[storeId]) {
        listeningStores.value[storeId] = {
            storeId,
            isEnabled: true
        };
    } else {
        listeningStores.value[storeId].storeId = storeId;
        listeningStores.value[storeId].isEnabled = true;
    }
}

export const removeListeningStore = (storeId: string) => {
    listeningStores.value[storeId].isEnabled = false;
}

const getLocalStorageKey = () => {
    if (!window.USER || !window.USER.id) {
        throw new Error('User not found');
    }
    return `MY_SETTINGS_LISTENING_STORES_${window.USER.id}`;
}

function initListeningStores() {
    console.log('initListeningStores');
    if (localStorage.hasOwnProperty(getLocalStorageKey())) {
        listeningStores.value = JSON.parse(localStorage.getItem(getLocalStorageKey()) || '{}');
    }
    watch(listeningStores, (newVal) => {
        localStorage.setItem(getLocalStorageKey(), JSON.stringify(newVal));
    }, { deep: true });
}

initListeningStores();
