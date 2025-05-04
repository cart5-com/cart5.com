import { listenStoreNotifier, disconnectStore } from '@orders-spa-vue/utils/listenStoreNotifier';
import { ref, watch } from 'vue';

// TODO: do I need more details than a boolean?
export type listeningStoresType = {
    storeId: string;
    isEnabled: boolean;
}

// record of storeId to isEnabled
export const MySettingsStore = ref<Record<string, listeningStoresType>>({});

export const addListeningStore = (storeId: string) => {
    if (!MySettingsStore.value[storeId]) {
        MySettingsStore.value[storeId] = {
            storeId,
            isEnabled: true
        };
    } else {
        MySettingsStore.value[storeId].storeId = storeId;
        MySettingsStore.value[storeId].isEnabled = true;
    }
    listenStoreNotifier(storeId);
}

export const removeListeningStore = (storeId: string) => {
    MySettingsStore.value[storeId].isEnabled = false;
    disconnectStore(storeId);
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
        MySettingsStore.value = JSON.parse(localStorage.getItem(getLocalStorageKey()) || '{}');
    }
    // for (const storeId in MySettingsStore.value) {
    //     if (MySettingsStore.value[storeId].isEnabled) {
    //         listenStoreNotifier(storeId);
    //     }
    // }

    watch(MySettingsStore, (newVal) => {
        localStorage.setItem(getLocalStorageKey(), JSON.stringify(newVal));
    }, { deep: true });
}

initListeningStores();
