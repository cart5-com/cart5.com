import { authGlobalApiClient } from "@api-client/auth_global";
import type { ResType } from '@api-client/typeUtils';
import { formatDate } from "./formatDate";

const orderDetailsApiPath = authGlobalApiClient[":orderId"].details.$get;
type OrderType = ResType<typeof orderDetailsApiPath>["data"];

const style = `
<style>
    body {
        padding: 2px;
        margin: 0px;
    }
    pre {
        padding: 2px;
        margin: 0px;
        max-width: fit-content;
        font-family: monospace;
        white-space: pre-wrap;
        word-wrap: break-word;
        overflow-wrap: break-word;
        font-weight: bold;
    }
    hr {
        border: 1px dashed #000;
    }
</style>
`

export const thermalPrinterFormat = (orderDetails: OrderType) => {
    const formatCurrency = (amount: number) => {
        if (!orderDetails?.taxSettingsJSON?.currencySymbol) return amount.toString();
        return `${orderDetails.taxSettingsJSON.currencySymbol}${amount}`;
    };

    const orderedQuantity = () => {
        return orderDetails?.orderedItemsJSON?.reduce((acc, item) => acc + item.quantity, 0) ?? 0;
    };

    // Header
    let output = '';
    output += `ORDER #${orderDetails.shortOtp} | ${orderDetails.orderStatus.toUpperCase()}\n`;
    output += `${formatDate(orderDetails.created_at_ts)}\n`;
    if (orderDetails.estimatedTimeText) {
        output += `${orderDetails.estimatedTimeText}\n`;
    }
    output += `<hr>`;

    // Delivery or Pickup details
    if (orderDetails.orderType === 'delivery' && orderDetails.deliveryAddressJSON) {
        output += `DELIVERY TO:\n`;
        output += `${orderDetails.deliveryAddressJSON.label}\n`;
        output += `${orderDetails.deliveryAddressJSON.address1}\n`;
        if (orderDetails.deliveryAddressJSON.address2) {
            output += `${orderDetails.deliveryAddressJSON.address2}\n`;
        }
        output += `${[orderDetails.deliveryAddressJSON.city, orderDetails.deliveryAddressJSON.state].filter(Boolean).join(', ')} ${orderDetails.deliveryAddressJSON.postalCode}\n`;
        if (orderDetails.deliveryAddressJSON.instructionsForDelivery) {
            output += `Instructions: ${orderDetails.deliveryAddressJSON.instructionsForDelivery}\n`;
        }
        output += `<hr>`;
    } else if (orderDetails.orderType === 'pickup') {
        output += `PICKUP NAME: ${orderDetails.pickupNickname}`;
        output += `<hr>`;
    }

    // Payment
    output += `PAYMENT: [${orderDetails?.paymentMethodJSON?.name}]\n`;
    output += `${orderDetails?.paymentMethodJSON?.isOnline ? 'Online payment' : 'In-person payment'}`;
    output += `<hr>`;

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
                result += ` ${item.details}\n`;
            }
            result += ` ${item.shownFee}`;
            return result;
        }).join('<hr>');
    }

    output += `<hr>`;
    output += `\n`;
    if (orderDetails.cartTotalsJSON) {
        output += `Subtotal: ${formatCurrency(orderDetails.cartTotalsJSON.shownFee)}\n`;
    }

    if (orderDetails.subtotalJSON?.bestDeliveryZone) {
        output += `Delivery Fee: ${formatCurrency(orderDetails.subtotalJSON.bestDeliveryZone.shownFee)}\n`;
    }

    if (orderDetails.subtotalJSON?.calculatedCustomServiceFees?.length) {
        orderDetails.subtotalJSON.calculatedCustomServiceFees.forEach(fee => {
            if (fee.shownFee > 0) {
                output += `${fee.name}: ${formatCurrency(fee.shownFee)}\n`;
            }
        });
    }

    if (orderDetails.cartBreakdownJSON && orderDetails.cartBreakdownJSON.buyerPaysTaxAndFeesShownFee > 0) {
        output += `${orderDetails.cartBreakdownJSON.buyerPaysTaxAndFeesName}: ${formatCurrency(orderDetails.cartBreakdownJSON.buyerPaysTaxAndFeesShownFee)}\n`;
    }

    if (orderDetails.cartBreakdownJSON && orderDetails.cartBreakdownJSON.discount > 0) {
        output += `Discount: -${formatCurrency(orderDetails.cartBreakdownJSON.discount)}\n`;
    }

    output += `<hr>`;
    output += `TOTAL: ${formatCurrency(orderDetails.finalAmount)}\n`;
    output += `<hr>`;

    return `<html><body>${style}<pre>${output}</pre></body></html>`;
}
