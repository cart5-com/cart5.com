import { deviceId, deviceSecretKey, setStatus } from './pairing';
import { printHTML } from './printHTML';
import { generateSignatureHeaders } from './generateSignatureHeaders';
import { createAutoprintTasksApiClient } from '@api-client/autoprint_tasks';
import type { ResType } from "@api-client/typeUtils";
import { createCustomEventSource } from './createCustomEventSource';

// Create API client
const apiClient = createAutoprintTasksApiClient(`${window.location.origin}/__p_api/api_autoprint_tasks`);

type TasksType = ResType<typeof apiClient["tasks"][":deviceId"]["$get"]>["data"]
export let currentPrintTasks: TasksType = [];
export let printedTaskIds: string[] = [];

let eventSource: ReturnType<typeof createCustomEventSource> | null = null;
let isConnected = false;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let autoRefreshTimeout: ReturnType<typeof setTimeout> | null = null;

export const listenTasks = async () => {
    // Don't create duplicate connections
    if (eventSource && isConnected) return;

    if (!deviceId || !deviceSecretKey) {
        console.error('Device not configured properly');
        setStatus('Device not configured properly', 'red');
        return;
    }

    disconnectListener(); // Close any existing connection

    // Get URL from API client
    const url = apiClient["listen"][":deviceId"].$url({
        param: { deviceId: deviceId }
    });
    url.searchParams.append('_', Date.now().toString()); // Cache buster

    eventSource = createCustomEventSource(url.toString(), await generateSignatureHeaders());

    // Add headers via fetch API before creating EventSource
    eventSource.onopen(() => {
        console.log('Task listener connected');
        setStatus('Connected to server', 'green');
        isConnected = true;
        fetchTasks(); // Fetch tasks immediately on connection
    });

    eventSource.onmessage((data) => {
        if (data === 'ping') {
            return;
        }

        try {
            const parsedData = JSON.parse(data);
            console.log('Received notification:', parsedData);
            // Notification received, fetch tasks
            fetchTasks();
        } catch (error) {
            console.error('Error parsing task notification:', error);
        }
    });

    eventSource.onerror((error) => {
        console.error('Task listener error:', error);
        isConnected = false;
        disconnectListener();

        // Attempt to reconnect after delay
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
        }
        reconnectTimeout = setTimeout(() => {
            listenTasks();
        }, import.meta.env.DEV ? 3_000 : 30_000); // 3s in dev, 30s in prod
    });
};

const disconnectListener = () => {
    if (eventSource) {
        eventSource.close();
        eventSource = null;
    }
    isConnected = false;
    console.log('Task listener disconnected');

    // Clear auto-refresh timeout when disconnecting
    if (autoRefreshTimeout) {
        clearTimeout(autoRefreshTimeout);
        autoRefreshTimeout = null;
    }
};

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
        return;
    }
    currentPrintTasks = data.sort((a, b) => a.created_at_ts - b.created_at_ts)
    startProcessingTasks()

    // Set up auto-refresh timeout
    autoRefreshTimeout = setTimeout(() => {
        if (isConnected) {
            fetchTasks();
        }
    }, 5 * 60_000); // 5 minutes
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
                disconnectListener();
                setStatus('Offline', 'red');
            }
        });
    } else {
        // If checkbox not available, connect directly
        listenTasks();
    }
};
