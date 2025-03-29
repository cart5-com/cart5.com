<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { AutoForm } from '@/ui-plus/auto-form'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from "zod";
import { showTurnstilePopup } from '@lib/clientUtils/showTurnstilePopup';
import { useFormPlus } from '@/ui-plus/form/useFormPlus'
import { Loader2 } from 'lucide-vue-next'
import { apiClient } from '@api-client/index';
import { loadMyStores } from '@dashboard-spa-vue/stores/StoreStore';
import { getTurnstileUrl } from '@lib/clientUtils/getAuthOrigin';
import { toast } from '@/ui-plus/sonner';
import { Badge } from '@/components/ui/badge';
import { websiteInfo, loadWebsiteInfo } from '@dashboard-spa-vue/stores/WebsiteInfo.Store';
import { onMounted } from 'vue';

const emit = defineEmits<{
    close: [values: { id: string, name: string }],
    cancel: [];
    onError: [error: any];
}>();

const schema = z.object({
    name: z.string().max(510, { message: "max 510" }).min(3, { message: "min 3" }),
})

const form = useForm({
    validationSchema: toTypedSchema(schema),
})

const { isLoading, globalError, handleError, withSubmit } = useFormPlus(form);

async function onSubmit(values: z.infer<typeof schema>) {
    let turnstile;
    try {
        turnstile = await showTurnstilePopup(
            getTurnstileUrl(import.meta.env.VITE_PUBLIC_DOMAIN_NAME)
        );
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error(errorMessage);
        return;
    }
    await withSubmit(async () => {
        const { data, error } = await (await apiClient.dashboard.store.create.$post({
            form: {
                name: values.name,
                turnstile
            },
        })).json()

        if (error) {
            handleError(error, form);
        } else {
            // Success
            await loadMyStores();
            emit('close', { id: data.id, name: values.name });
        }
    })
}

onMounted(async () => {
    await loadWebsiteInfo();
})
</script>

<template>
    <AutoForm class="space-y-6"
              :schema="schema"
              :form="form"
              @submit="onSubmit"
              :field-config="{
                name: {
                    label: 'Name',
                    inputProps: {
                        // disabled: true,
                    },
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
                         class="animate-spin" />
                Create
            </Button>
        </div>
    </AutoForm>
    <div class="flex flex-col gap-2 mb-4 border p-4 rounded-md border-foreground">
        <div>
            Support Organization:
            <Badge variant="secondary">
                {{ websiteInfo?.partnerInfo?.name }}
                ({{ websiteInfo?.partnerInfo?.defaultHostname }})
            </Badge>
            <div class="text-sm text-muted-foreground">
                This support team will be able to help you manage and maintain this new store.
            </div>
        </div>
    </div>
    <Button variant="secondary"
            @click="emit('cancel')"> Cancel </Button>
</template>