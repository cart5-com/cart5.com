import { apiClient } from "@api-client/index";
import { type ResType } from "@api-client/index";
import { ref } from "vue";

export type hostnameSupportTeamType = ResType<
    typeof apiClient.dashboard.team.my_teams.$get
>["data"];

export const hostnameSupportTeam = ref<hostnameSupportTeamType['hostnameSupportTeam'] | null>(null);

export const loadSupportTem = async () => {
    const { data, error } = await (await apiClient.dashboard.team.my_teams.$get()).json()
    if (error) {
        console.error(error)
    }
    console.log(data)
    hostnameSupportTeam.value = data.hostnameSupportTeam
}

loadSupportTem()