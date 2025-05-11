import { deviceId } from './pairing';
import { generateSignatureHeaders } from './utils/generateSignatureHeaders';
import { createAutoprintTasksApiClient } from '@api-client/autoprint_tasks';
import type { ResType } from "@api-client/typeUtils";
import { EventSourceWithHeaders } from '@lib/utils/EventSourceWithHeaders';
import { ref } from 'vue';
import { toast } from '@/ui-plus/sonner';
import { isPairedBefore } from './stores/isPairedBefore';
import { globalErrorText } from './stores/globalErrorText';
import { fetchTasks } from './tasks';
const apiClient = createAutoprintTasksApiClient(`${window.location.origin}/__p_api/autoprint_tasks`);
type TasksType = ResType<typeof apiClient["tasks"][":deviceId"]["$get"]>["data"]
export const currentPrintTasks = ref<TasksType>([]);

let eventSource: EventSourceWithHeaders | null = null;

export const listenTasks = async () => {
    // do not duplicate connection
    if (eventSource) {
        return;
    }
    // do not connect if online unchecked
    if (!isPairedBefore.value) {
        return;
    }
    fetchTasks();

    const url = apiClient["listen_tasks"][":deviceId"].$url({
        param: { deviceId: deviceId as string }
    });
    url.searchParams.append('_', Date.now().toString()); // Cache buster

    eventSource = new EventSourceWithHeaders(url.toString(), await generateSignatureHeaders());
    eventSource.onmessage = (event) => {
        if (event.data === 'ping') {
            return
        }
        fetchTasks();
        // there is no other type of event, just fetch and print new ones
        // try {
        //     const data = JSON.parse(event.data);
        //     console.log('data', data);
        // } catch (error) {
        //     console.error(error);
        //     fetchTasks();
        // }
    }
    eventSource.onopen = (_event) => {
        globalErrorText.value = '';
        toast.success('Ready to print');
    }
    eventSource.onerror = (_event) => {
        globalErrorText.value = 'print task listener error';
        eventSource?.close();
        eventSource = null;
        // toast.error('error, trying to reconnect...');
        setTimeout(() => {
            listenTasks();
        }, import.meta.env.DEV ? 3_000 : 30_000);
        console.log('eventSource.onerror', _event);
        console.log('eventSource.onerror.detail', (_event as CustomEvent).detail);
        if (
            (_event as CustomEvent) &&
            (_event as CustomEvent).detail &&
            (_event as CustomEvent).detail.error
        ) {
            const error = (_event as CustomEvent).detail.error;
            if (error.code === 'INVALID_SIGNATURE') {
                isPairedBefore.value = false;
                // toast.error('Not paired(Signature)');
            } else if (error.code === 'DEVICE_NOT_FOUND') {
                isPairedBefore.value = false;
                // toast.error('Not paired(Device)');
            }
        }
    }
}

export const stopListeningTasks = () => {
    if (eventSource) {
        // toast.info('Stopping listening tasks');
        eventSource.close();
        eventSource = null;
    }
}



listenTasks();