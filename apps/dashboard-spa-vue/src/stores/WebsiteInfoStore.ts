import { apiClient } from "@api-client/index";
import { type ResType } from "@api-client/index";
import { ref } from "vue";

type websiteInfoType = ResType<
    typeof apiClient.dashboard.website.info.$get
>["data"];

export const websiteInfo = ref<websiteInfoType | null>(null);

export const loadWebsiteInfo = async () => {
    const { data, error } = await (await apiClient.dashboard.website.info.$get()).json()
    if (error) {
        console.error(error)
    }
    if (data) {
        websiteInfo.value = data
        if (data.defaultHostname) {
            if (window.location.host !== data.defaultHostname) {
                window.location.href = window.location.href.replace(window.location.host, data.defaultHostname)
            }
        }
    } else {
        const publicDomain = `www.${import.meta.env.VITE_PUBLIC_DOMAIN_NAME}`
        if (window.location.host !== publicDomain) {
            window.location.href = window.location.href.replace(window.location.host, publicDomain)
        }
    }
}

loadWebsiteInfo()