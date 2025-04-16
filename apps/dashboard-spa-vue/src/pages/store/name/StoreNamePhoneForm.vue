<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { AutoForm } from '@/ui-plus/auto-form'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from "zod";
import { useFormPlus } from '@/ui-plus/form/useFormPlus'
import { Loader2, PlusIcon } from 'lucide-vue-next'
import { dashboardApiClient } from '@api-client/dashboard';
import { currentStoreId, setCurrentStoreName } from '@dashboard-spa-vue/stores/MyStoresStore';
import AutoFormFieldPhone from '@/ui-plus/PhoneNumber/AutoFormFieldPhone.vue';
import { onMounted, ref, watch } from 'vue';
import {
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form'
import SPhoneInput from '@/ui-plus/PhoneNumber/SPhoneInput.vue'
import { toast } from '@/ui-plus/sonner';
import { cleanEmptyProps } from '@lib/utils/cleanEmptyProps';
const schema = z.object({
    name: z.string().max(550, { message: "max 550" }).min(3, { message: "min 3" }),
    defaultPhoneNumber: z.string().min(1, { message: "required" }),
    extraPhoneNumbers: z.array(z.string().min(1, { message: "required" })).optional(),
})

const form = useForm({
    validationSchema: toTypedSchema(schema),
})

const { isLoading, globalError, handleError, withSubmit } = useFormPlus(form);

const loadData = async () => {
    isLoading.value = true;
    console.log('loadData', currentStoreId.value);
    // // sleep 1 second
    // await new Promise(resolve => setTimeout(resolve, 1000));
    const { data, error } = await (await dashboardApiClient.store[':storeId'].$post({
        param: {
            storeId: currentStoreId.value ?? '',
        },
        json: {
            columns: {
                name: true,
                defaultPhoneNumber: true,
                extraPhoneNumbers: true,
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
    isLoading.value = false;
}

onMounted(() => {
    loadData();
})



async function onSubmit(values: z.infer<typeof schema>) {
    await withSubmit(async () => {
        const { data, error } = await (await dashboardApiClient.store[':storeId'].$patch({
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
            toast.success(`Saved`);
            setCurrentStoreName(values.name);
        }
    })
}

/// Extra Phone Numbers
const phantomPhoneValues = ref<string[]>([])
let ignoreWatch = false;
// Add watcher for phoneNumbers
watch(() => form.values.extraPhoneNumbers, (newPhoneNumbers) => {
    if (ignoreWatch) {
        return;
    }
    if (newPhoneNumbers) {
        phantomPhoneValues.value = [...newPhoneNumbers]
    }
}, { immediate: true })


const addPhoneNumber = () => {
    ignoreWatch = true;
    const currentPhoneNumbers = form.values.extraPhoneNumbers || []
    form.setFieldValue('extraPhoneNumbers', [...currentPhoneNumbers, ''])
    phantomPhoneValues.value = [...phantomPhoneValues.value, '']
    setTimeout(() => {
        ignoreWatch = false;
    }, 1000)
}

const removePhoneNumber = (index: number) => {
    ignoreWatch = true;
    const currentPhoneNumbers = [...(form.values.extraPhoneNumbers || [])]
    currentPhoneNumbers.splice(index, 1)
    form.setFieldValue('extraPhoneNumbers', currentPhoneNumbers)
    phantomPhoneValues.value = [...phantomPhoneValues.value.slice(0, index), ...phantomPhoneValues.value.slice(index + 1)]
    setTimeout(() => {
        ignoreWatch = false;
    }, 1000)
}

</script>

<template>
    <AutoForm class="space-y-6"
              :schema="schema"
              :form="form"
              :field-config="{
                name: {
                    label: 'Store Name',
                },
                defaultPhoneNumber: {
                    label: 'Phone Number',
                    component: AutoFormFieldPhone
                },
            }"
              @submit="onSubmit">


        <template #extraPhoneNumbers>
            <div class="space-y-4 mt-4">
                <div v-for="(_, index) in (form.values.extraPhoneNumbers)"
                     :key="index">
                    <FormField v-slot="slotProps"
                               :name="`extraPhoneNumbers.${index}`">
                        <FormItem>
                            <!-- <FormLabel v-if="index === 0">Phone Numbers</FormLabel> -->
                            <div class="flex gap-2">
                                <FormControl>
                                    <!-- SPhoneInput here -->
                                    <SPhoneInput :fieldName="`extraPhoneNumbers.${index}`"
                                                 v-model="phantomPhoneValues[index]"
                                                 class="w-full"
                                                 @update="($event: any) => {
                                                    if ($event.isValid) {
                                                        slotProps.handleChange($event.e164)
                                                    } else {
                                                        slotProps.handleChange(undefined)
                                                    }
                                                }" />
                                    <!-- v-bind="slotProps.componentField" -->
                                </FormControl>
                                <Button type="button"
                                        variant="outline"
                                        size="icon"
                                        @click="removePhoneNumber(index)">
                                    ×
                                </Button>
                            </div>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                </div>

                <Button type="button"
                        variant="outline"
                        size="sm"
                        @click="addPhoneNumber">
                    <PlusIcon class="w-4 h-4" /> Add Extra Phone Number
                </Button>
            </div>
        </template>

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
</template>
