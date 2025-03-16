<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { AutoForm } from '@/ui-plus/auto-form'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from "zod";
import { useFormPlus } from '@/ui-plus/form/useFormPlus'
import { Loader2 } from 'lucide-vue-next'
import AutoFormFieldPhone from '@/ui-plus/PhoneNumber/AutoFormFieldPhone.vue'
import { onMounted } from 'vue';
const schema = z.object({
    phone: z.string(),
})

const form = useForm({
    validationSchema: toTypedSchema(schema),
})

const { isLoading, globalError,
    // handleError,
    withSubmit } = useFormPlus(form);

onMounted(() => {
    setTimeout(() => {
        form.setFieldValue('phone', '+445544443322')
    }, 1000)
})

async function onSubmit(values: z.infer<typeof schema>) {
    await withSubmit(async () => {
        console.log('values', values);
    })
}
</script>

<template>
    <AutoForm class="space-y-6"
              :schema="schema"
              :field-config="{
                phone: {
                    component: AutoFormFieldPhone
                },
            }"
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