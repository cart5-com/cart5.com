import { ref } from 'vue'
import { type useForm } from 'vee-validate';

export function useFormError() {
    const globalError = ref<string | null>(null)

    function handleError(error: any, form?: ReturnType<typeof useForm>) {
        console.error(error)
        globalError.value = error.message ?? (error.issues?.length === 0 ? "Unknown error" : null);
        if (form && error.issues?.length) {
            error.issues.forEach((issue: any) => {
                form.setFieldError(issue.path[0], issue.message)
            })
        }
    }

    function clearError() {
        globalError.value = null
    }

    return {
        globalError,
        handleError,
        clearError
    }
}