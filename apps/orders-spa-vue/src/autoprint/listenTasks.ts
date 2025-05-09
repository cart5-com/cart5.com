import { deviceId, deviceSecretKey, setStatus } from './pairing';
import { printHTML } from './printHTML';
import { generateSignatureHeaders } from './generateSignatureHeaders';
import { createAutoprintTasksApiClient } from '@api-client/autoprint_tasks';
import type { ResType } from "@api-client/typeUtils";
import { EventSourceWithHeaders } from './EventSourceWithHeaders';

// Create API client
const apiClient = createAutoprintTasksApiClient(`${window.location.origin}/__p_api/autoprint_tasks`);
const isOnlineCheckbox = document.querySelector<HTMLInputElement>('#is-online-checkbox');
type TasksType = ResType<typeof apiClient["tasks"][":deviceId"]["$get"]>["data"]
export let currentPrintTasks: TasksType = [];
export let printedTaskIds: string[] = [];
let autoRefreshTimeout: ReturnType<typeof setTimeout> | null = null;


let eventSource: EventSourceWithHeaders | null = null;
const listenTasks = async () => {
    // do not duplicate connection
    if (eventSource) {
        return;
    }
    // do not connect if online unchecked
    if (!isOnlineCheckbox?.checked) {
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
        setStatus('Ready to print', 'green');
    }
    eventSource.onerror = (_event) => {
        eventSource?.close();
        eventSource = null;
        setStatus('error, trying to reconnect...', 'red');
        setTimeout(() => {
            listenTasks();
        }, import.meta.env.DEV ? 3_000 : 30_000);
    }
}



const fetchTasks = async () => {
    // Clear any existing timeout before setting a new one
    if (autoRefreshTimeout) {
        clearTimeout(autoRefreshTimeout);
    }

    if (!deviceId || !deviceSecretKey) {
        console.error('Device not configured properly');
        return;
    }
    const { data, error } = await (await apiClient["tasks"][":deviceId"].$get({
        param: { deviceId: deviceId }
    }, {
        headers: await generateSignatureHeaders()
    })).json();
    if (error) {
        console.error('Error fetching tasks:', error);
    } else { }
    currentPrintTasks = (data || []).sort((a, b) => a.created_at_ts - b.created_at_ts)

    if (currentPrintTasks.length > 0) {
        startProcessingTasks()
    }

    // Set up auto-refresh timeout
    autoRefreshTimeout = setTimeout(() => {
        if (isOnlineCheckbox?.checked) {
            fetchTasks();
        }
    }, 300_000); // 5 minutes
};

const startProcessingTasks = async () => {
    while (currentPrintTasks.length > 0) {
        const task = currentPrintTasks.shift()
        if (!task) {
            break;
        }
        if (printedTaskIds.includes(task.taskId)) {
            await deleteTask(task.taskId);
            continue;
        }
        await printHTML(task.html || 'error-with-html', task.printerName, task.copies || 1);
        await deleteTask(task.taskId);
        printedTaskIds.push(task.taskId);
        await new Promise(resolve => setTimeout(resolve, 1000))
    }
}

const deleteTask = async (taskId: string) => {
    if (!deviceId || !deviceSecretKey) {
        console.error('Device not configured properly');
        return;
    }
    const { error } = await (await apiClient["tasks"][":deviceId"][":taskId"].$delete({
        param: {
            deviceId: deviceId,
            taskId: taskId
        }
    }, {
        headers: await generateSignatureHeaders()
    })).json();
    if (error) {
        console.error('Error deleting task:', error);
        return;
    }
};

// Connect when the module is imported
export const initTaskListener = () => {
    // Connect when the isOnlineCheckbox is checked
    const isOnlineCheckbox = document.querySelector<HTMLInputElement>('#is-online-checkbox');
    if (isOnlineCheckbox) {
        if (isOnlineCheckbox.checked) {
            listenTasks();
        }

        isOnlineCheckbox.addEventListener('change', () => {
            if (isOnlineCheckbox.checked) {
                listenTasks();
            } else {
                setStatus('Offline', 'red');
            }
        });
    } else {
        // If checkbox not available, connect directly
        listenTasks();
    }
};
