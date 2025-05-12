import { authGlobalApiClient } from "@api-client/auth_global";
import type { ResType } from '@api-client/typeUtils';
import { thermalPrinterFormat } from "@lib/utils/printerFormat";
const orderDetailsApiPath = authGlobalApiClient[":orderId"].get_order.$get;
type OrderType = ResType<typeof orderDetailsApiPath>["data"];

export const printOrder = (orderDetails: OrderType) => {
    const html = thermalPrinterFormat(orderDetails);
    const iframe = document.createElement("iframe");

    // Set iframe properties before appending to body
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    iframe.style.position = "fixed";
    iframe.style.top = "0";
    iframe.style.left = "0";
    iframe.style.zIndex = "916000020";
    iframe.style.visibility = "hidden"; // Hide initially to avoid flicker

    // Use blob URL instead of direct writing for better loading behavior
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    iframe.src = url;

    // Set up load event before appending to DOM
    iframe.onload = () => {
        // Show iframe once loaded
        iframe.style.visibility = "visible";

        // Small delay to ensure rendering is complete
        setTimeout(() => {
            // Get iframe's window reference again after it's loaded
            const iframeWindow = iframe.contentWindow;
            if (!iframeWindow) {
                console.error("Could not access iframe's window");
                return;
            }

            iframeWindow.print();

            // Clean up after printing dialog is closed
            setTimeout(() => {
                document.body.removeChild(iframe);
                URL.revokeObjectURL(url); // Clean up the blob URL
            }, 500);
        }, 100);
    };

    // Append to body after setup is complete
    document.body.appendChild(iframe);
}