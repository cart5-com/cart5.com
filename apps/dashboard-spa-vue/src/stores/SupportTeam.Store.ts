import { apiClient } from "@api-client/index";
import { type ResType } from "@api-client/index";
import { ref } from "vue";

export type hostnameSupportTeamType = ResType<
    typeof apiClient.dashboard.team.get_team_by_hostname.$get
>["data"];

export const hostnameSupportTeam = ref<hostnameSupportTeamType | null>(null);

export const loadSupportTeam = async () => {
    const { data, error } = await (await apiClient.dashboard.team.get_team_by_hostname.$get()).json()
    if (error) {
        console.error(error)
    }
    if (data) {
        hostnameSupportTeam.value = data
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

loadSupportTeam()