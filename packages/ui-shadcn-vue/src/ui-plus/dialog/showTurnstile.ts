import { useDialog } from "./use-dialog";

export const showTurnstile = async function (sitekey: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
        const { show, cancel, showBlockingLoadingModal, getDialog } = useDialog();
        const lModal = showBlockingLoadingModal();
        const randomId = `turnstile${(Math.floor(Math.random() * 1e15)).toString(36)}`;
        const turnstileHtml = `
        <div id="${randomId}" class="my-4">
          <div class="w-fit mx-auto">
            <div class="cf-turnstile"></div>
          </div>
        </div>
      `;

        const modalId = show({
            // title: "Please wait for verification",
            title: "",
            html: turnstileHtml,
            closeable: false
        });

        const titleTimeout = setTimeout(() => {
            const dialog = getDialog(modalId);
            if (dialog) {
                dialog.options.title = "Please verify by checking the box below";
            }
        }, 2000);

        (window as any)[randomId] = function () {
            try {
                cancel(lModal);
                if ((window as any).turnstile) {
                    (window as any).turnstile.render(`#${randomId} .cf-turnstile`, {
                        sitekey: sitekey,
                        "error-callback": function (error: any) {
                            clearTimeout(titleTimeout);
                            console.log("error window.turnstile.render");
                            console.log(error);
                            if (error.toString() !== "300030") {
                                throw error;
                            }
                            reject(error);
                        },
                        callback: function (token: string) {
                            clearTimeout(titleTimeout);
                            cancel(modalId);
                            resolve(token);
                        },
                    });
                }
            } catch (e) {
                clearTimeout(titleTimeout);
                console.log("error window.turnstile.render");
                console.log(e);
            }
        };

        const script = document.createElement('script');
        script.src = `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=${randomId}`;
        document.head.appendChild(script);
        setTimeout(() => {
            script.remove();
        });
    });
};