<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { AutoForm } from '@/ui-plus/auto-form'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from "zod";
import { useFormPlus } from '@/ui-plus/form/useFormPlus'
import { Loader2 } from 'lucide-vue-next'
import { apiClient } from '@api-client/index';
import { currentWebsiteId, setCurrentWebsiteName } from '@dashboard-spa-vue/stores/MyWebsites.store';
import { onMounted } from 'vue';
import { toast } from '@/ui-plus/sonner';

const schema = z.object({
    name: z.string().max(550, { message: "max 550" }).min(3, { message: "min 3" }),
})

const form = useForm({
    validationSchema: toTypedSchema(schema),
})

const { isLoading, globalError, handleError, withSubmit } = useFormPlus(form);

const loadData = async () => {
    isLoading.value = true;
    const { data, error } = await (await apiClient.dashboard.website[':websiteId'].$post({
        param: { websiteId: currentWebsiteId.value ?? '' },
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
    isLoading.value = false;
};

onMounted(() => {
    loadData();
});

async function onSubmit(values: z.infer<typeof schema>) {
    if (!currentWebsiteId.value) return;

    await withSubmit(async () => {
        const websiteId = currentWebsiteId.value;
        if (!websiteId) return;

        const { error } = await (await apiClient.dashboard.website[':websiteId'].$patch({
            param: { websiteId },
            json: {
                name: values.name,
            },
        })).json();

        if (error) {
            handleError(error, form);
        } else {
            setCurrentWebsiteName(values.name);
            toast.success("Website name saved");
        }
    });
}
</script>

<template>
    <AutoForm class="space-y-6"
              :schema="schema"
              :form="form"
              @submit="onSubmit"
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
                    class="w-full my-6">
                <Loader2 v-if="isLoading"
                         class="animate-spin mr-2 h-4 w-4" />
                Save
            </Button>
        </div>
    </AutoForm>
</template>