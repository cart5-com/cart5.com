import { useDialog } from '@/ui-plus/dialog/use-dialog';
import PhoneValidationForm from '@/ui-plus/PhoneNumber/validation/PhoneValidationForm.vue';

const dialog = useDialog();

export function showPhoneValidationForm(pageUrl: string) {
    return new Promise((resolve) => {
        dialog.show({
            title: 'One time phone verification',
            description: 'please enter your mobile phone number for one time verification',
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