<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { AutoForm } from '@/ui-plus/auto-form'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from "zod";
import { showTurnstile } from '@/ui-plus/dialog/showTurnstile'
import { useFormPlus } from '@/ui-plus/form/useFormPlus'
import { Loader2 } from 'lucide-vue-next'
import { dashboardApiClient } from '@src/lib/dashboardApiClient';
import { myRestaurants } from '@src/stores/RestaurantStore';

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
    await withSubmit(async () => {
        const { data, error } = await (await dashboardApiClient.api_dashboard.restaurant.create.$post({
            form: {
                name: values.name,
                turnstile: await showTurnstile(import.meta.env.VITE_PUBLIC_TURNSTILE_SITE_KEY)
            },
        })).json()
        if (error) {
            handleError(error, form);
        } else {
            // Success
            myRestaurants.value = [...myRestaurants.value, { id: data, name: values.name, address: { address1: null } }];
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
    <Button variant="secondary"
            @click="emit('cancel')"> Cancel </Button>
</template>