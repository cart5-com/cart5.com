import { useDialog } from '@/ui-plus/dialog/use-dialog';
import PhoneValidationForm from '@/ui-plus/PhoneNumber/validation/PhoneValidationForm.vue';

const dialog = useDialog();

export function showPhoneValidationForm(pageUrl: string) {
    return new Promise((resolve) => {
        dialog.show({
            title: 'One-time phone verification',
            description: 'Please enter your mobile phone number for verification. This is a one-time process and will not be required in the future.',
            component: PhoneValidationForm,
            props: {
                pageUrl: pageUrl,
            },
            onSuccess: () => {
                resolve(1);
            },
            onError: () => {
                resolve(0);
            },
            onCancel: () => {
                resolve(0);
            }
        })
    })
}