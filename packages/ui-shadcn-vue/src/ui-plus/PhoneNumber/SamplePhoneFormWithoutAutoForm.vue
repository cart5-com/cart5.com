<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useFormPlus } from '@/ui-plus/form/useFormPlus'
import { Button } from '@/components/ui/button'
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-vue-next'
import SPhoneInput from '@/ui-plus/PhoneNumber/SPhoneInput.vue'
import { ref, onMounted, watch } from 'vue'

const formSchema = toTypedSchema(z.object({
    username: z.string().min(2).max(50),
    phoneNumbers: z.array(z.string().min(1)),
}))

const form = useForm({
    validationSchema: formSchema,
    // initialValues: {
    //     username: 'asd',
    //     phoneNumbers: ['+445544443322', '+905418889933'],
    // }
})

onMounted(() => {
    setTimeout(() => {
        form.setFieldValue('phoneNumbers', [
            '+445544443322',
            '+905418889933'
        ])
    }, 1000)
})


const addPhoneNumber = () => {
    const currentPhoneNumbers = form.values.phoneNumbers || []
    form.setFieldValue('phoneNumbers', [...currentPhoneNumbers, ''])
}

const removePhoneNumber = (index: number) => {
    const currentPhoneNumbers = [...(form.values.phoneNumbers || [])]
    currentPhoneNumbers.splice(index, 1)
    form.setFieldValue('phoneNumbers', currentPhoneNumbers)
}

const { isLoading, globalError, handleError, withSubmit } = useFormPlus(form);

const onSubmit = form.handleSubmit(async (values) => {
    await withSubmit(async () => {
        // wait 3 seconds
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log('Form submitted!', values)
        handleError({
            message: 'random error',
        }, form);
    })
})

const phoneValues = ref<string[]>([])
// Add watcher for phoneNumbers
watch(() => form.values.phoneNumbers, (newPhoneNumbers) => {
    if (newPhoneNumbers) {
        phoneValues.value = [...newPhoneNumbers]
    }
}, { immediate: true })
</script>

<template>
    <form @submit="onSubmit">
        <FormField v-slot="{ componentField }"
                   name="username">
            <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                    <Input type="text"
                           placeholder="shadcn"
                           v-bind="componentField" />
                </FormControl>
                <FormDescription>
                    This is your public display name.
                </FormDescription>
                <FormMessage />
            </FormItem>
        </FormField>

        <div class="space-y-4 mt-4">
            <div v-for="(_, index) in (form.values.phoneNumbers)"
                 :key="index">
                <FormField v-slot="slotProps"
                           :name="`phoneNumbers.${index}`">
                    <FormItem>
                        <FormLabel v-if="index === 0">Phone Numbers</FormLabel>
                        <div class="flex gap-2">
                            <FormControl>
                                <SPhoneInput v-model="phoneValues[index]"
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
                Add Extra Phone Number
            </Button>
        </div>

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
    </form>
</template>