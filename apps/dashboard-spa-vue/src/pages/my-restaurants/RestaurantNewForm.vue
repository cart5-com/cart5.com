<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { AutoForm } from '@/ui-plus/auto-form'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from "zod";
import { showTurnstilePopup } from '@lib/clientUtils/showTurnstilePopup';
import { useFormPlus } from '@/ui-plus/form/useFormPlus'
import { Loader2 } from 'lucide-vue-next'
import { dashboardApiClient } from '@src/lib/dashboardApiClient';
import { myRestaurants } from '@src/stores/RestaurantStore';
import { getTurnstileUrl } from '@lib/clientUtils/getAuthOrigin';
import { toast } from '@/ui-plus/sonner';
import { Badge } from '@/components/ui/badge';
import { hostnameSupportTeam } from '@src/stores/SupportTeam.Store';
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
        const { data, error } = await (await dashboardApiClient.api_dashboard.restaurant.create.$post({
            form: {
                name: values.name,
                turnstile
            },
        })).json()

        if (error) {
            handleError(error, form);
        } else {
            // Success
            myRestaurants.value = [...myRestaurants.value, { id: data, name: values.name, address1: null }];
            emit('close', { id: data, name: values.name });
        }
    })
}

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
                {{ hostnameSupportTeam?.name }}
                ({{ hostnameSupportTeam?.defaultHostname }})
            </Badge>
            <div class="text-sm text-muted-foreground">
                This support team will be able to help you manage and maintain this new restaurant.
            </div>
        </div>
    </div>
    <Button variant="secondary"
            @click="emit('cancel')"> Cancel </Button>
</template>