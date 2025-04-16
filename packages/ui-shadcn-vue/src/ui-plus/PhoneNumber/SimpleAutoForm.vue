<!-- <script setup lang="ts">
import { Button } from '@/components/ui/button'
import { AutoForm } from '@/ui-plus/auto-form'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from "zod";
import { useFormPlus } from '@/ui-plus/form/useFormPlus'
import { Loader2 } from 'lucide-vue-next'
import { dashboardApiClient } from '@src/lib/dashboardApiClient';
import { currentStoreId, setCurrentStoreName } from '@src/stores/MyStoresStore';
import AutoFormFieldPhone from '@/ui-plus/PhoneNumber/AutoFormFieldPhone.vue';
import { onMounted } from 'vue';

const schema = z.object({
    name: z.string().max(550, { message: "max 550" }).min(3, { message: "min 3" }),
    defaultPhoneNumber: z.string(),
})

const form = useForm({
    validationSchema: toTypedSchema(schema),
})

const { isLoading, globalError, handleError, withSubmit } = useFormPlus(form);

const loadData = async () => {
    console.log('loadData', currentStoreId.value);
    const { data, error } = await (await dashboardApiClient.api_dashboard.store[':storeId'].$post({
        param: {
            storeId: currentStoreId.value ?? '',
        },
        json: {
            columns: {
                name: true,
                defaultPhoneNumber: true,
            }
        }
    })).json()
    if (error) {
        handleError(error, form);
    } else {
        if (data) {
            for (const key in data) {
                const typedKey = key as keyof typeof schema.shape;
                if (data[typedKey]) {
                    form.setFieldValue(typedKey, data[typedKey]);
                }
            }
        }
    }
}

onMounted(() => {
    isLoading.value = true;
    setTimeout(() => {
        loadData();
        isLoading.value = false;
    }, 1000)
})



async function onSubmit(values: z.infer<typeof schema>) {
    await withSubmit(async () => {
        const { data, error } = await (await dashboardApiClient.api_dashboard.store[':storeId'].$patch({
            param: {
                storeId: currentStoreId.value ?? '',
            },
            json: cleanEmptyProps(values)
        })).json()
        if (error) {
            handleError(error, form);
        } else {
            // Success
            console.log('data', data);
            setCurrentStoreName(values.name);
        }
    })
}
</script>

<template>
    <AutoForm class="space-y-6"
              :schema="schema"
              :form="form"
              :field-config="{
                defaultPhoneNumber: {
                    label: 'Phone Number',
                    component: AutoFormFieldPhone
                },
            }"
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
                Save
            </Button>
        </div>
    </AutoForm>
</template> -->