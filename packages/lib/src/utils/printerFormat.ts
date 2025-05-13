import { authGlobalApiClient } from "@api-client/auth_global";
import type { ResType } from '@api-client/typeUtils';
import { formatDate } from "./formatDate";
import { estimatedTimeText1 } from "./estimatedTimeText";
import { formatCurrency } from "./formatCurrency";

const orderDetailsApiPath = authGlobalApiClient[":orderId"].get_order.$post;
type OrderType = ResType<typeof orderDetailsApiPath>["data"]['order'];

const style = `
<style>
    body {
        padding: 0px;
        margin: 0px;
    }
    pre {
        width: 230px;
        margin: 15px;
        overflow: hidden;
        max-width: fit-content;
        font-family: monospace;
        white-space: pre-wrap;
        word-wrap: break-word;
        overflow-wrap: break-word;
        font-weight: bold;
    }
    pre h6 {
        margin: 0px;
        font-size: 1rem;
        font-weight: bold;
    }
    pre h5 {
        margin: 0px;
        font-size: 1.5rem;
        font-weight: bold;
    }
    hr {
        border: 1px dashed #000;
    }
</style>
`

export const thermalPrinterFormat = (
    orderDetails: OrderType,
    locale: string | undefined = undefined
) => {
    const orderedQuantity = () => {
        return orderDetails?.orderedItemsJSON?.reduce((acc, item) => acc + item.quantity, 0) ?? 0;
    };

    // Header
    let output = '';
    output += `${orderDetails.storeName}|${orderDetails.storeAddress1}`;
    output += `<h5>#${orderDetails.shortOtp}</h5>`;
    if (orderDetails.orderType === 'pickup') {
        output += `<h5>${orderDetails.pickupNickname || orderDetails.userName || 'unknown'}</h5>`;
    } else if (orderDetails.orderType === 'delivery') {
        output += `<h5>${orderDetails.deliveryAddressJSON?.nickname || orderDetails.pickupNickname || orderDetails.userName || 'unknown'}</h5>`;
    }
    output += `<hr>`;
    output += `<h6>${orderDetails?.paymentMethodJSON?.isOnline ? '[PAID-ONLINE]' : '[NOT PAID]'}|${orderDetails?.paymentMethodJSON?.name}</h6>`;
    output += `<hr>`;
    if (orderDetails.userVerifiedPhoneNumbers) {
        output += `${orderDetails.userVerifiedPhoneNumbers}\n`;
    }
    // TODO: fix with store timezone
    output += `${formatDate(
        orderDetails.created_at_ts || Date.now(),
        orderDetails.storeTimezone || undefined,
        false
    )}\n`;
    if (orderDetails.estimatedTimeJSON) {
        output += `${estimatedTimeText1(orderDetails.orderType!, orderDetails.estimatedTimeJSON)}\n`;
    }
    output += `<hr>`;

    // Delivery or Pickup details
    if (orderDetails.orderType === 'delivery' && orderDetails.deliveryAddressJSON) {
        output += `DELIVERY TO:\n`;
        output += `${orderDetails.deliveryAddressJSON.address1}\n`;
        if (orderDetails.deliveryAddressJSON.address2) {
            output += `${orderDetails.deliveryAddressJSON.address2}\n`;
        }
        // output += `${[orderDetails.deliveryAddressJSON.city, orderDetails.deliveryAddressJSON.state].filter(Boolean).join(', ')} ${orderDetails.deliveryAddressJSON.postalCode}\n`;
        if (orderDetails.deliveryAddressJSON.instructionsForDelivery) {
            output += `Instructions: ${orderDetails.deliveryAddressJSON.instructionsForDelivery}\n`;
        }
        output += `<hr>`;
    }

    // Order Notes
    if (orderDetails.orderNote) {
        output += `NOTE: ${orderDetails.orderNote}`;
        output += `<hr>`;
    }

    // Order Items
    output += `\n`;
    output += `ITEMS (${orderedQuantity()}):\n`;
    output += `<hr>`;

    if (orderDetails.orderedItemsJSON?.length) {
        output += orderDetails.orderedItemsJSON.map(item => {
            let result = `${item.quantity}x ${item.name}\n`;
            if (item.details) {
                result += ` ${item.details}`;
            }
            result += ` ${item.shownFee}`;
            return result;
        }).join('<hr>');
    }

    output += `<hr>`;
    output += `\n`;
    if (orderDetails.cartTotalsJSON) {
        output += `Subtotal: ${formatCurrency(orderDetails.cartTotalsJSON.shownFee, orderDetails.taxSettingsJSON?.currency, locale)}\n`;
    }

    if (orderDetails.subtotalJSON?.bestDeliveryZone) {
        output += `Delivery Fee: ${formatCurrency(orderDetails.subtotalJSON.bestDeliveryZone.shownFee, orderDetails.taxSettingsJSON?.currency, locale)}\n`;
    }

    if (orderDetails.subtotalJSON?.calculatedCustomServiceFees?.length) {
        orderDetails.subtotalJSON.calculatedCustomServiceFees.forEach(fee => {
            if (fee.shownFee > 0) {
                output += `${fee.name}: ${formatCurrency(fee.shownFee, orderDetails.taxSettingsJSON?.currency, locale)}\n`;
            }
        });
    }

    if (orderDetails.cartBreakdownJSON && orderDetails.cartBreakdownJSON.buyerPaysTaxAndFeesShownFee > 0) {
        output += `${orderDetails.cartBreakdownJSON.buyerPaysTaxAndFeesName}: ${formatCurrency(orderDetails.cartBreakdownJSON.buyerPaysTaxAndFeesShownFee, orderDetails.taxSettingsJSON?.currency, locale)}\n`;
    }

    if (orderDetails.cartBreakdownJSON && orderDetails.cartBreakdownJSON.discount > 0) {
        output += `Discount: -${formatCurrency(orderDetails.cartBreakdownJSON.discount, orderDetails.taxSettingsJSON?.currency, locale)}\n`;
    }

    output += `<hr>`;
    output += `TOTAL: ${formatCurrency(orderDetails.finalAmount, orderDetails.taxSettingsJSON?.currency, locale)}\n`;
    output += `<hr>`;

    return `<html><body>${style}<pre>${output}</pre></body></html>`;
}
