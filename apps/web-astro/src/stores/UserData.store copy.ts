// import { apiClient } from "@api-client/index";
// import { ref, watch } from "vue";
// import { toast } from "@/ui-plus/sonner";
// import type { ResType } from "@api-client/index";
// import type { UserAddress } from "@lib/types/UserAddressType";

// // export type UserDataStoreType = ResType<typeof apiClient.auth_global.get_user_data.$post>["data"];
// // // Extend the type to include our local anonymous user data structure
// // export type ExtendedUserDataStoreType = UserDataStoreType | {
// //     user: null;
// //     userData: LocalUserDataType;
// // export const userDataStore = ref<ExtendedUserDataStoreType | null>(null);
// // export type UserDataType = NonNullable<NonNullable<UserDataStoreType>["userData"]>;
// // export type LocalUserDataType = Pick<UserDataType, "rememberLastAddressId" | "addresses">;

// // const LOCAL_USER_DATA_KEY = 'ANONYMOUS_USER_DATA_V1';

// // Simplified types
// export type UserData = {
//     rememberLastAddressId: string;
//     addresses: UserAddress[];
// };

// export type StoreData = {
//     isAuthenticated: boolean;
//     userData: UserData;
// };

// // Initialize store with default values
// export const userDataStore = ref<StoreData>({
//     isAuthenticated: false,
//     userData: {
//         rememberLastAddressId: "",
//         addresses: [],
//     }
// });

// // Constants
// const LOCAL_STORAGE_KEY = 'ANONYMOUS_USER_DATA_V1';
// const SAVE_DELAY = 1000; // 1 second

// // Save helper variables
// let saveTimeout: ReturnType<typeof setTimeout> | null = null;
// let isSaving = false;

// // CORE FUNCTIONALITY

// export const loadUserData = async () => {
//     if (import.meta.env.SSR) return;

//     // Check if we're in post-login state
//     const isAfterLogin = typeof window !== 'undefined' && window.location.hash === '#after-login';
//     if (isAfterLogin && typeof window !== 'undefined') {
//         history.replaceState(null, '', window.location.pathname + window.location.search);
//     }

//     try {
//         // Try to fetch authenticated user data
//         const { data, error } = await (await apiClient.auth_global.get_user_data.$post({
//             json: {
//                 columns: {
//                     rememberLastAddressId: true,
//                     addresses: true,
//                 }
//             }
//         })).json();

//         if (error) {
//             throw new Error("Failed to fetch user data");
//         }

//         if (data?.user) {
//             // Authenticated user
//             userDataStore.value = {
//                 isAuthenticated: true,
//                 userData: {
//                     rememberLastAddressId: data.userData?.rememberLastAddressId || "",
//                     addresses: data.userData?.addresses as UserAddress[] || [],
//                 }
//             };

//             // Sync anonymous data if needed
//             if (isAfterLogin) {
//                 await syncAnonymousData();
//                 await loadUserData(); // Reload to get updated data
//             }
//         } else {
//             // Anonymous user - load from localStorage
//             userDataStore.value = {
//                 isAuthenticated: false,
//                 userData: loadFromLocalStorage()
//             };
//         }

//         // Set up auto-save watcher
//         watch(userDataStore, () => saveUserData(), { deep: true });
//     } catch (e) {
//         console.error("Error loading user data:", e);
//         toast.error("Failed to load user data");

//         // Fallback to anonymous mode
//         userDataStore.value = {
//             isAuthenticated: false,
//             userData: loadFromLocalStorage()
//         };
//     }
// };

// // Save data with debouncing
// const saveUserData = () => {
//     if (saveTimeout) clearTimeout(saveTimeout);

//     saveTimeout = setTimeout(async () => {
//         if (isSaving) return;
//         isSaving = true;

//         try {
//             if (userDataStore.value.isAuthenticated) {
//                 // Save to server
//                 await saveToServer(userDataStore.value.userData);
//             } else {
//                 // Save to localStorage
//                 saveToLocalStorage(userDataStore.value.userData);
//             }
//         } finally {
//             isSaving = false;
//         }
//     }, SAVE_DELAY);
// };

// // Update user data
// export const updateUserData = (updates: Partial<UserData>) => {
//     if (!userDataStore.value) {
//         loadUserData();
//         return false;
//     }

//     // Update addresses if provided
//     let updatedAddresses = [...userDataStore.value.userData.addresses];
//     if (updates.addresses) {
//         // Create a map of existing addresses for easy update/merge
//         const addressMap = new Map();
//         updatedAddresses.forEach(addr => addressMap.set(addr.addressId, addr));

//         // Update or add new addresses
//         updates.addresses.forEach(addr => addressMap.set(addr.addressId, addr));

//         updatedAddresses = Array.from(addressMap.values());
//     }

//     // Update the store
//     userDataStore.value = {
//         ...userDataStore.value,
//         userData: {
//             rememberLastAddressId: updates.rememberLastAddressId ?? userDataStore.value.userData.rememberLastAddressId,
//             addresses: updatedAddresses
//         }
//     };

//     return true;
// };

// // Logout from all sessions
// export const logoutAll = async () => {
//     try {
//         const { error } = await (await apiClient.auth_global["logout-all"].$post()).json();
//         if (error) {
//             throw new Error("Failed to logout");
//         }

//         // Reset and reload user data
//         userDataStore.value.isAuthenticated = false;
//         loadUserData();
//     } catch (e) {
//         toast.error("Failed to logout");
//         console.error(e);
//     }
// };

// // Redirect to login with return URL
// export const redirectToLogin = (redirectUrl?: string) => {
//     if (typeof window !== 'undefined') {
//         const returnTo = redirectUrl || window.location.pathname + window.location.search;
//         window.location.href = `/login?returnTo=${encodeURIComponent(returnTo)}#after-login`;
//     }
// };

// // HELPER FUNCTIONS

// // Load anonymous user data from localStorage
// const loadFromLocalStorage = (): UserData => {
//     if (typeof localStorage === 'undefined') {
//         return { rememberLastAddressId: "", addresses: [] };
//     }

//     try {
//         const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
//         return saved ? JSON.parse(saved) : { rememberLastAddressId: "", addresses: [] };
//     } catch (e) {
//         return { rememberLastAddressId: "", addresses: [] };
//     }
// };

// // Save anonymous user data to localStorage
// const saveToLocalStorage = (userData: UserData) => {
//     if (typeof localStorage !== 'undefined') {
//         localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userData));
//     }
// };

// // Save authenticated user data to server
// const saveToServer = async (userData: UserData) => {
//     try {
//         const { error } = await (await apiClient.auth_global.update_user_data.$patch({
//             json: {
//                 rememberLastAddressId: userData.rememberLastAddressId,
//                 addresses: userData.addresses
//             }
//         })).json();

//         if (error) {
//             console.error(error);
//             toast.error("Failed to save user data");
//         };
//     } catch (e) {
//         console.error("Error saving to server:", e);
//     }
// };

// // Sync anonymous data to authenticated user
// const syncAnonymousData = async () => {
//     const localData = loadFromLocalStorage();

//     // Only sync if there's data to sync
//     if (!localData.addresses.length && !localData.rememberLastAddressId) {
//         return false;
//     }

//     try {
//         // Get current user data
//         const { data, error } = await (await apiClient.auth_global.get_user_data.$post({
//             json: {
//                 columns: {
//                     rememberLastAddressId: true,
//                     addresses: true,
//                 }
//             }
//         })).json();

//         if (error) throw new Error("Failed to fetch existing user data");

//         // Merge addresses
//         const existingAddresses = data?.userData?.addresses || [];
//         const existingIds = new Set(existingAddresses.map(addr => addr.addressId));

//         const mergedAddresses = [...existingAddresses];
//         localData.addresses.forEach(addr => {
//             if (!existingIds.has(addr.addressId)) {
//                 mergedAddresses.push(addr);
//             }
//         });

//         // Use local ID only if server doesn't have one
//         const finalId = data?.userData?.rememberLastAddressId || localData.rememberLastAddressId || "";

//         // Update with merged data
//         const { error: updateError } = await (await apiClient.auth_global.update_user_data.$patch({
//             json: {
//                 rememberLastAddressId: finalId,
//                 addresses: mergedAddresses as UserAddress[]
//             }
//         })).json();

//         if (updateError) throw new Error("Failed to sync data");

//         // Clear local data after successful sync
//         if (typeof localStorage !== 'undefined') {
//             localStorage.removeItem(LOCAL_STORAGE_KEY);
//         }

//         return true;
//     } catch (e) {
//         toast.error("Failed to sync your data");
//         console.error(e);
//         return false;
//     }
// };

// // Initialize store
// loadUserData();