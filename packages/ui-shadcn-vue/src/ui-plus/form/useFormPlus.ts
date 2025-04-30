import { ref } from 'vue'
import { type useForm } from 'vee-validate';
import { watch } from 'vue';

interface PersistenceOptions {
    // Fields to persist and their corresponding storage keys
    persistenceFields: Record<string, string>;
}

/**
 * A composable that enhances vee-validate's useForm with additional functionality:
 * 
 * - Loading state management during form submission
 * - Global error handling for API responses
 * - Field-level error handling for API validation errors
 * - Form field persistence in localStorage
 * - Debounced form submission
 * 
 * @param form - The form instance returned from vee-validate's useForm
 * @param options - Configuration options
 * @param options.persistenceFields - Object mapping form field names to localStorage keys for persistence
 * 
 * @returns {Object} Form enhancement utilities
 * @returns {Ref<boolean>} isLoading - Whether the form is currently submitting
 * @returns {Ref<string|null>} globalError - Global error message if any
 * @returns {Function} handleError - Function to handle API errors, sets global and field-level errors
 * @returns {Function} clearError - Clears the global error
 * @returns {Function} withSubmit - Wrapper for submit handlers that manages loading state and adds debounce
 * 
 * @example
 * ```ts
 * const form = useForm({...})
 * const { isLoading, globalError, handleError, withSubmit } = useFormPlus(form, {
 *   persistenceFields: {
 *     email: 'remembered_email'
 *   }
 * })
 * 
 * async function onSubmit(values) {
 *   await withSubmit(async () => {
 *     const { error } = await api.submit(values)
 *     if (error) {
 *       handleError(error, form)
 *     }
 *   })
 * }
 * ```
 */
export function useFormPlus(form?: ReturnType<typeof useForm>, options?: PersistenceOptions) {
    const isLoading = ref(false)
    const globalError = ref<string | null>(null)

    if (form) {
        watch(form.isSubmitting, (isSubmitting) => {
            if (!isSubmitting) return;
            for (const fieldName of Object.keys(form.errors.value)) {
                const name = fieldName.replace('[', '.').replace(']', '')
                const field = document.querySelector<HTMLElement>(`[name="${name}"]`)
                if (field && !field.classList.contains('headShake-animation')) {
                    field.classList.add('headShake-animation')
                    setTimeout(() => {
                        field.classList.remove('headShake-animation')
                    }, 500)
                    try { field.focus() } catch (error) { console.error(error) }
                }
                break;
            }
        })
    }

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

    const withSubmit = async <T>(callback: () => Promise<T>) => {
        clearError()
        isLoading.value = true
        try {
            return await callback()
        } finally {
            await new Promise(resolve => setTimeout(resolve, 300));
            isLoading.value = false
        }
    }

    const restoreValues = () => {
        if (!options?.persistenceFields || !form) return;
        if (typeof window !== 'undefined' && window.localStorage) {
            Object.entries(options.persistenceFields).forEach(([fieldName, storageKey]) => {
                const savedValue = localStorage.getItem(storageKey);
                if (savedValue) {
                    form.setFieldValue(fieldName, savedValue);
                }
            });
        }
    };


    const startWatchingPersistenceFields = () => {
        if (typeof window === "undefined") return;
        if (!options?.persistenceFields) return;
        if (!form) return;
        // Watch form values and save to storage
        watch(
            () => form.values,
            (newValues: Record<string, any>) => {
                Object.entries(options.persistenceFields).forEach(([fieldName, storageKey]) => {
                    if (newValues[fieldName]) {
                        localStorage.setItem(storageKey, newValues[fieldName]);
                    }
                });
            },
            { deep: true }
        );

        setTimeout(() => {
            restoreValues();
        }, 100);
    }

    startWatchingPersistenceFields();

    return {
        isLoading,
        globalError,
        handleError,
        clearError,
        withSubmit,
        restoreValues
    }
}