import {
    getMainWindow,
} from "./mainWindow";
import { toast } from "@/ui-plus/sonner";


export const printHTML = async function (
    html: string,
    printer: string,
    copies: number = 1,
) {
    // const mainWindow = getMainWindow();
    // mainWindow.hide();
    // getMainWindow().hide();

    // TODO: check if printer is in the list of printers, maybe we should report it sender store email.
    // const printers = await getPrinters();
    // console.log(printers);

    // const style = document.getElementById('autoprint-style');
    // if (!style) {
    //     return;
    // }
    // style.remove();
    const app = document.getElementById('app');
    if (!app) {
        return;
    }
    const oldDisplay = app.style.display;
    app.style.display = 'none';

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
            if (typeof global === "undefined") {
                toast.message('simulating print...');
                iframeWindow.print();
            } else {
                getMainWindow().print({
                    autoprint: true,
                    silent: true,
                    printer: printer, //"HP_DeskJet_2700_series", // "Save as PDF"
                    // pdf_path: not working with mac, I don't know why
                    headerFooterEnabled: false,
                    landscape: false,
                    shouldPrintBackgrounds: false,
                    marginsType: 1,
                    copies: copies,
                    // scaleFactor
                    // headerString
                    // footerString
                    // marginsCustom
                    // mediaSize
                    /*/
                    win.print(options)
                    Print the web contents in the window with or without the need for user’s interaction. options is a JSON object with the following fields:
                    
                    autoprint {Boolean} whether to print without the need for user’s interaction; optional, true by default
                    silent {Boolean} hide the flashing print preview dialog; optional, false by default
                    printer {String} the device name of the printer returned by nw.Window.getPrinters(); No need to set this when printing to PDF
                    pdf_path {String} the path of the output PDF when printing to PDF
                    headerFooterEnabled {Boolean} whether to enable header and footer
                    landscape {Boolean} whether to use landscape or portrait
                    shouldPrintBackgrounds {Boolean} whether to print CSS backgrounds
                    marginsType {Integer} 0 - Default; 1 - No margins; 2 - minimum; 3 - Custom, see marginsCustom.
                    copies {Integer} the number of copies to print.
                    scaleFactor {Integer} the scale factor; 100 is the default.
                    headerString {String} string to replace the URL in the header.
                    footerString {String} string to replace the URL in the footer.
                    marginsCustom {JSON Object} the custom margin setting; units are points.
                    marginsCustom example: "marginsCustom":{"marginBottom":54,"marginLeft":70,"marginRight":28,"marginTop":32}
                    mediaSize {JSON Object} the paper size spec
                    mediaSize example: 'mediaSize':{'name': 'CUSTOM', 'width_microns': 279400, 'height_microns': 215900, 'custom_display_name':'Letter', 'is_default': true}
                    
                    NOTE: If no options are being passed, win.print({}) is what should be called.
                    /*/

                });
            }
            // Clean up after printing dialog is closed
            setTimeout(() => {
                document.body.removeChild(iframe);
                URL.revokeObjectURL(url); // Clean up the blob URL
                app.style.display = oldDisplay;
                // document.head.appendChild(style);
            }, 500);
        }, 100);
    };

    // Append to body after setup is complete
    document.body.appendChild(iframe);
};