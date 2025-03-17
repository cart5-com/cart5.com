<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { AutoForm } from '@/ui-plus/auto-form'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from "zod";
import { useFormPlus } from '@/ui-plus/form/useFormPlus'
import { Loader2 } from 'lucide-vue-next'
import { dashboardApiClient } from '@src/lib/dashboardApiClient';
import { currentWebsite, currentWebsiteId, setCurrentWebsiteName } from '@src/stores/WebsiteStore';
import { computed, onMounted, ref } from 'vue';

const schema = z.object({
    name: z.string().max(510, { message: "max 510" }).min(3, { message: "min 3" }),
})

const form = useForm({
    validationSchema: toTypedSchema(schema),
})

const { isLoading, globalError, handleError, withSubmit } = useFormPlus(form);
const isInitialLoading = ref(true);

const initialValues = computed(() => {
    if (!currentWebsite.value) return { name: '' };
    return {
        name: currentWebsite.value.name,
    };
});

onMounted(async () => {
    if (!currentWebsiteId.value) return;

    try {
        const { data, error } = await (await dashboardApiClient.api_dashboard.website[':websiteId'].$post({
            param: { websiteId: currentWebsiteId.value },
            json: {
                columns: {
                    id: true,
                    defaultHostname: true,
                    supportTeamId: true,
                    name: true,
                }
            }
        })).json();

        if (error) {
            handleError(error, form);
        } else if (data) {
            form.setValues({
                name: data.name,
            });
        }
    } catch (error) {
        console.error(error);
    } finally {
        isInitialLoading.value = false;
    }
});

async function onSubmit(values: z.infer<typeof schema>) {
    if (!currentWebsiteId.value) return;

    await withSubmit(async () => {
        const websiteId = currentWebsiteId.value;
        if (!websiteId) return;

        const { error } = await (await dashboardApiClient.api_dashboard.website[':websiteId'].$patch({
            param: { websiteId },
            json: {
                name: values.name,
            },
        })).json();

        if (error) {
            handleError(error, form);
        } else {
            setCurrentWebsiteName(values.name);
        }
    });
}
</script>

<template>
    <div v-if="isInitialLoading"
         class="flex justify-center items-center py-8">
        <Loader2 class="h-8 w-8 animate-spin" />
    </div>
    <div v-else>
        <AutoForm class="space-y-6"
                  :schema="schema"
                  :form="form"
                  @submit="onSubmit"
                  :initial-values="initialValues"
                  :field-config="{
                    name: {
                        label: 'Website Name',
                        description: 'The name of your website',
                    },
                }">
            <div class="text-sm font-medium text-destructive"
                 v-if="globalError">
                {{ globalError }}
            </div>
            <div>
                <Button type="submit"
                        :disabled="isLoading"
                        class="w-full sm:w-auto">
                    <Loader2 v-if="isLoading"
                             class="mr-2 h-4 w-4 animate-spin" />
                    Save Changes
                </Button>
            </div>
        </AutoForm>
    </div>
</template>