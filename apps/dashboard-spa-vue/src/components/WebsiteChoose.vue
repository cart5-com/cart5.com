<script setup lang="ts">
import { myWebsites, type websiteListType } from '@dashboard-spa-vue/stores/MyWebsitesStore';
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-vue-next';
import { toast } from '@/ui-plus/sonner';
import { websiteInfo } from '@dashboard-spa-vue/stores/WebsiteInfoStore';

const open = ref(false);

const onWebsiteSelected = (website: websiteListType[number]) => {
    if (website.defaultHostname) {
        if (window.location.host !== website.defaultHostname) {
            window.location.href = window.location.href.replace(window.location.host, website.defaultHostname);
        }
    } else {
        toast.error('domain not defined for this website')
        console.log('no default hostname', website);
    }
}

</script>

<template>
    <Popover v-model:open="open">
        <PopoverTrigger asChild>
            <Button variant="outline">
                {{ websiteInfo?.name }}
                <ChevronsUpDown class="opacity-50" />
            </Button>
        </PopoverTrigger>
        <PopoverContent class="w-full p-0">
            <Command>
                <CommandInput placeholder="Search " />
                <CommandEmpty>No found.</CommandEmpty>
                <CommandList>
                    <CommandGroup heading="Your websites">
                        <CommandItem v-for="website in myWebsites"
                                     :key="website.id"
                                     :value="website.name ?? '' + ' ' + website.defaultHostname"
                                     @select="() => {
                                        open = false;
                                        onWebsiteSelected(website);
                                    }">
                            <div class="flex flex-col gap-1 border-b pb-2 w-full">
                                <div class="flex items-center gap-2">
                                    <Check v-if="website.id === websiteInfo?.websiteId" />
                                    {{ website.name }}
                                </div>
                                <div class="text-sm text-muted-foreground">
                                    {{ website.defaultHostname }}
                                </div>
                            </div>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </Command>
        </PopoverContent>
    </Popover>
</template>
