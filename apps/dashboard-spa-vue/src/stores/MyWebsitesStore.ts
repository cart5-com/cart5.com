import { ref, computed } from 'vue'
import { type ResType } from '@api-client/typeUtils';
import { dashboardApiClient } from '@api-client/dashboard';

export type websiteListType = ResType<
    typeof dashboardApiClient.website.my_websites.$get
>["data"];

// Define a more specific type for website data
export interface Website {
    id: string;
    name: string;
    defaultHostname: string | null;
}

export const myWebsites = ref<Website[]>([]);
export const searchQuery = ref('')
export const myWebsitesFiltered = computed(() =>
    myWebsites.value.filter(website =>
        website.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        website.defaultHostname?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
)

export const currentWebsiteId = ref<string | null>(null);

export const currentWebsite = computed(() => {
    if (!currentWebsiteId.value) return null;
    return myWebsites.value.find(website => website.id === currentWebsiteId.value);
});


export async function loadMyWebsites() {
    console.log('loadMyWebsites');
    const { data, error } = await (await dashboardApiClient.website.my_websites.$get()).json()
    if (error) {
        console.error(error)
        return
    } else {
        myWebsites.value = data;
    }
}

export function setCurrentWebsiteId(websiteId: string) {
    currentWebsiteId.value = websiteId
}

export function setCurrentWebsiteName(name: string) {
    if (!currentWebsiteId.value) return;
    const website = myWebsites.value.find(website => website.id === currentWebsiteId.value);
    if (website) {
        website.name = name;
    }
}

loadMyWebsites(); 