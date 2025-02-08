<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { AutoForm } from '@/ui-plus/auto-form'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from "zod";

const emit = defineEmits<{
    close: [values: { name: string }],
    cancel: [];
    onError: [error: any];
}>();

const schema = z.object({
    name: z.string().max(510, { message: "max 510" }).min(2, { message: "min 2" }),
})

const form = useForm({
    validationSchema: toTypedSchema(schema),
})

async function onSubmit(values: z.infer<typeof schema>) {
    emit('close', values);
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
        <div>
            <Button type="submit"
                    class="w-full my-6">
                Create
            </Button>
        </div>
    </AutoForm>
    <Button variant="secondary"
            @click="emit('cancel')"> Cancel </Button>
</template>