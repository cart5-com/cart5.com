<script setup lang="ts">
import { myTeams, MyTeamsType } from '@src/stores/TeamStore';
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-vue-next';


const open = ref(false);

const onTeamSelected = (team: MyTeamsType['myTeams'][number]) => {
    if (team.defaultHostname) {
        if (window.location.host !== team.defaultHostname) {
            // window.location.href = `https://${team.defaultHostname}/dash/`;
            window.location.href = window.location.href.replace(window.location.host, team.defaultHostname);
        }
    } else {
        console.log('no default hostname', team);
    }
}
</script>

<template>
    <Popover v-model:open="open">
        <PopoverTrigger asChild>
            <Button variant="outline">
                {{ myTeams.currentTeam?.name }}
                <ChevronsUpDown class="opacity-50" />
            </Button>
        </PopoverTrigger>
        <PopoverContent class="w-full p-0">
            <Command>
                <CommandInput placeholder="Search " />
                <CommandEmpty>No found.</CommandEmpty>
                <CommandList>
                    <CommandGroup>
                        <CommandItem v-for="team in myTeams.myTeams"
                                     :key="team.teamId"
                                     :value="team.name ?? '' + ' ' + team.defaultHostname"
                                     @select="() => {
                                        open = false;
                                        onTeamSelected(team);
                                    }">
                            <div class="flex flex-col gap-1 border-b pb-2 w-full">
                                <div class="flex items-center gap-2">
                                    <Check v-if="team.teamId === myTeams.currentTeam?.teamId" />
                                    {{ team.name }}
                                </div>
                                <div class="text-sm text-muted-foreground">
                                    {{ team.defaultHostname }}
                                </div>
                            </div>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </Command>
        </PopoverContent>
    </Popover>
</template>
