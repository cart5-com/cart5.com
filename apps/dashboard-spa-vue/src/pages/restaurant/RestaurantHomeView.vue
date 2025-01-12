<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { AutoForm } from '@/ui-plus/auto-form'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { object as z_object, string as z_string, type infer as z_infer } from "zod";
import { useFormPlus } from '@/ui-plus/form/useFormPlus'
import { Loader2 } from 'lucide-vue-next'
import { dashboardApiClient } from '@src/lib/dashboardApiClient';
import { currentRestaurantId, myRestaurants } from './_restaurantStore';

const schema = z_object({
    name: z_string().max(255),
})

const form = useForm({
    validationSchema: toTypedSchema(schema),
})

const loadData = async () => {
    const { data, error } = await (await dashboardApiClient.api.dashboard.restaurant[':restaurantId'].$post({
        param: {
            restaurantId: currentRestaurantId.value ?? '',
        },
        json: {
            columns: {
                name: true,
                id: true,
            }
        }
    })).json()
    if (error) {
        handleError(error, form);
    } else {
        if (data) {
            for (const key in data) {
                // @ts-ignore
                form.setFieldValue(key, data[key]);
            }
        }
    }
}

loadData();

const { isLoading, globalError, handleError, withSubmit } = useFormPlus();

async function onSubmit(values: z_infer<typeof schema>) {
    await withSubmit(async () => {
        const { data, error } = await (await dashboardApiClient.api.dashboard.restaurant.update[':restaurantId'].$post({
            param: {
                restaurantId: currentRestaurantId.value ?? '',
            },
            json: values
        })).json()
        if (error) {
            handleError(error, form);
        } else {
            // Success
            console.log('data', data);
            const restaurant = myRestaurants.value.find(restaurant => restaurant.id === currentRestaurantId.value);
            if (restaurant) {
                restaurant.name = values.name;
            }
        }
    })
}
</script>

<template>
    <AutoForm class="space-y-6"
              :schema="schema"
              :form="form"
              @submit="onSubmit">
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
                Update
            </Button>
        </div>
    </AutoForm>
</template>