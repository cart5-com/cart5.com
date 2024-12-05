import { type useForm } from 'vee-validate';
import { watch } from 'vue';

interface PersistenceOptions {
    // Fields to persist and their corresponding storage keys
    fields: Record<string, string>;
}

export function useFormPersistence(form: ReturnType<typeof useForm>, options: PersistenceOptions) {
    if (typeof window === "undefined") return;
    // Watch form values and save to storage
    watch(
        () => form.values,
        (newValues: Record<string, any>) => {
            Object.entries(options.fields).forEach(([fieldName, storageKey]) => {
                if (newValues[fieldName]) {
                    localStorage.setItem(storageKey, newValues[fieldName]);
                }
            });
        },
        { deep: true }
    );

    // Restore values from storage
    const restoreValues = () => {
        if (typeof window !== 'undefined' && window.localStorage) {
            Object.entries(options.fields).forEach(([fieldName, storageKey]) => {
                const savedValue = localStorage.getItem(storageKey);
                if (savedValue) {
                    form.setFieldValue(fieldName, savedValue);
                }
            });
        }
    };

    setTimeout(() => {
        restoreValues();
    }, 100);

    return {
        restoreValues
    };
}