<script lang="ts" setup>
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircleIcon } from "lucide-vue-next";
import { myWebsitesFiltered, myWebsites, searchQuery } from '@src/stores/WebsiteStore'
import HeaderOnly from '@src/layouts/HeaderOnly.vue';
// import { useDialog } from '@/ui-plus/dialog/use-dialog';
// import WebsiteNewForm from "@src/pages/my-websites/WebsiteNewForm.vue";
import { useRouter } from 'vue-router';
const router = useRouter();
// const dialog = useDialog();
const IS_DEV = import.meta.env.DEV;

const openNewWebsiteDialog = () => {
    router.push('/new-website');
    // dialog.show<websiteListType[number]>({
    //     title: "Add New Website",
    //     closeable: false,
    //     component: WebsiteNewForm,
    //     onSuccess: async (values) => {
    //         console.log("success");
    //         console.log(values);
    //     },
    //     onError: async (error: any) => {
    //         console.log("error");
    //         console.log(error);
    //     }
    // });
}

</script>

<template>
    <HeaderOnly>
        <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex flex-col gap-1">
                <h3 class="text-2xl font-bold tracking-tight">My Websites</h3>
                <!-- <p class="text-muted-foreground text-sm">As a manager, you can view and manage all your websites
                    below.</p> -->
            </div>
            <Button class="w-full sm:w-auto"
                    @click="openNewWebsiteDialog">
                <PlusCircleIcon class="mr-2 h-5 w-5" />
                Add New Website
            </Button>
        </div>
        <div class="mb-4"
             v-if="myWebsites.length > 3 || IS_DEV">
            <Input v-model="searchQuery"
                   placeholder="Search by name or domain"
                   class="max-w-sm" />
        </div>
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <RouterLink v-for="website in myWebsitesFiltered"
                        :key="website.id"
                        :to="`/website/${website.id}`"
                        class="block">
                <Card class="bg-muted hover:bg-muted/20 h-24 transition-colors">
                    <CardHeader>
                        <CardTitle class="text-lg"> {{ website.name }}</CardTitle>
                        <CardDescription>{{ website.defaultHostname }}</CardDescription>
                    </CardHeader>
                </Card>
            </RouterLink>
        </div>
    </HeaderOnly>
</template>