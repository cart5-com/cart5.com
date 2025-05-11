import { ref, watch } from 'vue';
import { setOpenAlwaysTopOnWindowText } from '../openAlwaysTopOnWindow';

export const globalErrorText = ref('');

setTimeout(() => {
    watch(globalErrorText, (newVal) => {
        if (newVal) {
            setOpenAlwaysTopOnWindowText('❌');
        } else {
            setOpenAlwaysTopOnWindowText('✅');
        }
    }, { immediate: true });
}, 1000);
