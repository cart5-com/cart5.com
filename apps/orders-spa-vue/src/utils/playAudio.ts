import { ref } from 'vue';

export const isAbleToPlayAudio = ref(true);

export const playBlankAudioLoop = () => {
    const audio = document.getElementById('blank-loop') as HTMLAudioElement;
    if (audio) {
        audio.play()
            .then(() => {
                isAbleToPlayAudio.value = true;
            })
            .catch((error) => {
                isAbleToPlayAudio.value = false;
                console.warn('📣📣📣Audio permission denied📣📣📣');
                console.error(error);
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
            .catch((error) => {
                isAbleToPlayAudio.value = false;
                console.warn('📣📣📣Audio permission denied📣📣📣');
                console.error(error);
            });
    }
}
