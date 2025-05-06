import { ref, watchEffect } from 'vue';
import { cachedStoreOrders } from "@orders-spa-vue/stores/RecentOrdersStore";
import { ORDER_STATUS_OBJ } from "@lib/types/orderStatus";

export const isAbleToPlayAudio = ref(true);
// Sound interval reference to clear when needed
let soundInterval: ReturnType<typeof setInterval> | null = null;
// Title flashing interval
let titleInterval: ReturnType<typeof setInterval> | null = null;
// Store original document title
let originalTitle = document.title;

export const playBlankAudioLoop = () => {
    const audio = document.getElementById('blank-loop') as HTMLAudioElement;
    if (audio) {
        audio.play()
            .then(() => {
                isAbleToPlayAudio.value = true;
            })
            .catch(() => {
                isAbleToPlayAudio.value = false;
                // console.warn('📣📣📣Audio permission denied📣📣📣');
                // console.error(error);
            });
    }
    playNotificationAudio();
}

export const playNotificationAudio = () => {
    const audio = document.getElementById('notification-audio') as HTMLAudioElement;
    if (audio) {
        audio.currentTime = 0;
        audio.play()
            .then(() => {
                isAbleToPlayAudio.value = true;
            })
            .catch(() => {
                isAbleToPlayAudio.value = false;
                // console.warn('📣📣📣Audio permission denied📣📣📣');
                // console.error(error);
            });
    }
}

// Toggle document title for new orders alert
const flashTitle = (newOrdersCount: number) => {
    // Store original title when first called
    if (!titleInterval) {
        originalTitle = document.title;
    }

    // Clear existing interval if any
    if (titleInterval) {
        clearInterval(titleInterval);
    }

    let isAlert = false;
    titleInterval = setInterval(() => {
        if (isAlert) {
            document.title = originalTitle;
        } else {
            document.title = `🚨 ${newOrdersCount} new ${newOrdersCount === 1 ? 'order' : 'orders'}`;
        }
        isAlert = !isAlert;
    }, 2000);
}

// Watch for orders with "CREATED" status and play notification sounds
export const watchNewOrders = () => {
    watchEffect(() => {
        const newOrders = Object.values(cachedStoreOrders.value).filter(
            order => order.orderStatus === ORDER_STATUS_OBJ.CREATED
        );

        const hasNewOrders = newOrders.length > 0;

        // Clear existing interval if any
        if (soundInterval) {
            clearInterval(soundInterval);
            soundInterval = null;
        }

        // Stop title flashing if no new orders
        if (!hasNewOrders && titleInterval) {
            clearInterval(titleInterval);
            titleInterval = null;
            document.title = originalTitle;
        }
        if (hasNewOrders) {
            // Flash title with count of new orders
            flashTitle(newOrders.length);
        }

        // Set up interval only if there are new orders
        if (hasNewOrders && isAbleToPlayAudio.value) {
            // Play immediately when detected
            playNotificationAudio();

            // Then set up interval to play every 5 seconds
            soundInterval = setInterval(() => {
                playNotificationAudio();
            }, 30_000);

        }
    });
}
