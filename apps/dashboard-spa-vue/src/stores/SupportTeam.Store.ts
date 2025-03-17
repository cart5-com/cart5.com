import { dashboardApiClient } from "@src/lib/dashboardApiClient";
import { type ResType } from "@api-client/ecomApiClient";
import { ref } from "vue";

export type hostnameSupportTeamType = ResType<
    typeof dashboardApiClient.api_dashboard.team.my_teams.$get
>["data"];

export const hostnameSupportTeam = ref<hostnameSupportTeamType['hostnameSupportTeam'] | null>(null);

export const loadSupportTem = async () => {
    const { data, error } = await (await dashboardApiClient.api_dashboard.team.my_teams.$get()).json()
    if (error) {
        console.error(error)
    }
    console.log(data)
    hostnameSupportTeam.value = data.hostnameSupportTeam
}

loadSupportTem()