import { ref, watch, onMounted } from "vue";

const STORAGE_KEY = "PRINTED_TASK_IDS";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const printedTaskIds = ref<{ taskId: string, printedAtTs: number }[]>([]);

// Load from localStorage and remove entries older than 1 day
onMounted(() => {
    const taskIds = localStorage.getItem(STORAGE_KEY);
    if (taskIds) {
        const parsedIds = JSON.parse(taskIds);
        const now = Date.now();
        // Filter out entries older than 1 day
        printedTaskIds.value = parsedIds.filter(
            (item: { taskId: string, printedAtTs: number }) =>
                now - item.printedAtTs < ONE_DAY_MS
        );
    }
});

// Save to localStorage whenever the array changes
watch(printedTaskIds, (newValue) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newValue));
}, { deep: true });