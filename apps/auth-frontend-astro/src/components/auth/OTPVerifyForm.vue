<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'

const props = defineProps<{
    verifyEmail: string
}>();

const emit = defineEmits<{
    close: [values: z.infer<typeof schema>],
    cancel: [];
}>();

const schema = z.object({
    verifyEmail: z.string().email(),
    code: z.string().min(8).max(8),
})

const formSchema = toTypedSchema(schema)

const form = useForm({
    validationSchema: formSchema,
})

form.setFieldValue("verifyEmail", props.verifyEmail);
const onSubmit = form.handleSubmit((values) => {
    emit('close', values);
})
</script>

<template>
    <form class="space-y-6"
          @submit="onSubmit">
        <FormField v-slot="{ componentField }"
                   name="verifyEmail">
            <FormItem>
                <FormControl>
                    <Input type="text"
                           disabled
                           v-bind="componentField" />
                </FormControl>
                <FormMessage />
            </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }"
                   name="code">
            <FormItem>
                <FormLabel>One-time password</FormLabel>
                <FormControl>
                    <Input type="text"
                           autofocus
                           v-bind="componentField" />
                </FormControl>
                <FormMessage />
            </FormItem>
        </FormField>
        <div>
            <Button type="submit"
                    class="mt-10 w-full">
                Submit
            </Button>
        </div>
    </form>
    <Button variant="outline"
            @click="emit('cancel')"> Cancel </Button>
</template>