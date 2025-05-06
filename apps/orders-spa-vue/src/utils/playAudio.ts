import { ref, watchEffect } from 'vue';
import { cachedStoreOrders } from "@orders-spa-vue/stores/RecentOrdersStore";
import { ORDER_STATUS_OBJ } from "@lib/types/orderStatus";

export const isAbleToPlayAudio = ref(true);
// Sound interval reference to clear when needed
let soundInterval: ReturnType<typeof setInterval> | null = null;

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

// Watch for orders with "CREATED" status and play notification sounds
export const watchNewOrders = () => {
    watchEffect(() => {
        const hasNewOrders = Object.values(cachedStoreOrders.value).some(
            order => order.orderStatus === ORDER_STATUS_OBJ.CREATED
        );

        // Clear existing interval if any
        if (soundInterval) {
            clearInterval(soundInterval);
            soundInterval = null;
        }

        // Set up interval only if there are new orders
        if (hasNewOrders && isAbleToPlayAudio.value) {
            // Play immediately when detected
            playNotificationAudio();

            // Then set up interval to play every 30 seconds
            soundInterval = setInterval(() => {
                playNotificationAudio();
            }, 5_000);
        }
    });
}
