import { currentPrintTasks } from "./listenTasks";
import { deviceId, deviceSecretKey } from "./pairing";
import { generateSignatureHeaders } from "./utils/generateSignatureHeaders";
import { printHTML } from "./utils/printHTML";
import { isPairedBefore } from "./stores/isPairedBefore";
import { createAutoprintTasksApiClient } from "@api-client/autoprint_tasks";
import { printedTaskIds } from "./stores/printedTaskIds";

let autoRefreshTimeout: ReturnType<typeof setTimeout> | null = null;
const apiClient = createAutoprintTasksApiClient(`${window.location.origin}/__p_api/autoprint_tasks`);

const startProcessingTasks = async () => {
    while (currentPrintTasks.value.length > 0) {
        const task = currentPrintTasks.value.shift()
        if (!task) {
            break;
        }
        if (printedTaskIds.value.find(t => t.taskId === task.taskId)) {
            await deleteTask(task.taskId);
            continue;
        }
        await printHTML(task.html || 'error-with-html', task.printerName, task.copies || 1);
        await deleteTask(task.taskId);
        printedTaskIds.value.push({
            taskId: task.taskId,
            printedAtTs: Date.now()
        });
        await new Promise(resolve => setTimeout(resolve, 1000))
    }
}

export const fetchTasks = async () => {
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
    currentPrintTasks.value = (data || []).sort((a, b) => a.created_at_ts - b.created_at_ts)

    if (currentPrintTasks.value.length > 0) {
        startProcessingTasks()
    }

    // Set up auto-refresh timeout
    autoRefreshTimeout = setTimeout(() => {
        if (isPairedBefore.value) {
            fetchTasks();
        }
    }, 300_000); // 5 minutes
};


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