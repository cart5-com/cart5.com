import { type Context } from 'hono'
import { KNOWN_ERROR, type ErrorType } from '@lib/types/errors';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { getUserOrderData_Service } from '@db/services/order.service';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { ValidatorContext } from '@api-hono/types/ValidatorContext';
import { verifyStripeCheckoutSession_inStripeConnectedAccount } from '@api-hono/utils/stripe/verifyStripeCheckoutSession_inStripeConnectedAccount';
import { getStoreAutomationRules_Service } from '@db/services/store.service';
import { saveOrderAfterStipePaymentVerification_Service } from '@db/services/order.transactional.service';
import { ORDER_STATUS_OBJ } from '@lib/types/orderStatus';
import { sendNotificationToStore } from '@api-hono/routes/api_orders/listen_store.controller';
import { getLocaleFromAcceptLanguageHeader } from '@lib/utils/getLocaleFromAcceptLanguageHeader';


export const getOrder_SchemaValidator = zValidator('json', z.object({
    // checkStripePaymentStatus: z.boolean().optional(),
}))

export const getOrderRoute = async (
    c: Context<
        HonoVariables,
        "/:orderId/get_order",
        ValidatorContext<typeof getOrder_SchemaValidator>
    >
) => {
    const orderId = c.req.param('orderId');
    // const { checkStripePaymentStatus } = c.req.valid('json');
    if (!orderId) {
        throw new KNOWN_ERROR("Order ID not found", "ORDER_ID_NOT_FOUND");
    }
    const host = c.req.header()['host'];
    if (!host) {
        throw new KNOWN_ERROR("Host not found", "HOST_NOT_FOUND");
    }
    const user = c.get("USER");
    if (!user || !user.id) {
        throw new KNOWN_ERROR("User not found", "USER_NOT_FOUND");
    }
    // TODO: should I select only userId to check permission/ then select all fields?
    const order = await getUserOrderData_Service(orderId, user.id);
    if (!order) {
        throw new KNOWN_ERROR("Order not found", "ORDER_NOT_FOUND");
    }
    if (order.userId !== user.id) {
        throw new KNOWN_ERROR("Permission denied", "PERMISSION_DENIED");
    }
    const ipAddress = c.req.header()['x-forwarded-for'] || c.req.header()['x-real-ip'];
    const locale = getLocaleFromAcceptLanguageHeader(c.req.header()['accept-language']);
    let stripeCheckoutSessionUrl: string | undefined = undefined;
    let stripeError: ErrorType | undefined = undefined;
    if (
        order.orderStatus === ORDER_STATUS_OBJ.PENDING_PAYMENT_AUTHORIZATION &&
        order.isOnlinePaymentVerified !== true
    ) {
        const { stripeCheckoutSession, error } = await verifyStripeCheckoutSession_inStripeConnectedAccount(order);
        stripeCheckoutSessionUrl = stripeCheckoutSession?.url ?? undefined;
        stripeError = error;
        if (!error) {
            order.orderStatus = ORDER_STATUS_OBJ.CREATED;
            order.isOnlinePaymentVerified = true;
            order.created_at_ts = Date.now();
            // means success
            const storeAutomationRules = await getStoreAutomationRules_Service(order.storeId, {
                autoAcceptOrders: true,
                autoPrintRules: true
            });
            await saveOrderAfterStipePaymentVerification_Service(
                orderId,
                order,
                {
                    newStatus: order.orderStatus,
                    changedByUserId: user.id,
                    changedByIpAddress: ipAddress,
                    type: 'user',
                },
                (storeAutomationRules?.autoAcceptOrders) ?
                    {
                        storeId: order.storeId,
                        changedByUserId: undefined,
                        changedByIpAddress: undefined,
                        type: 'automatic_rule'
                    }
                    :
                    undefined,
                (storeAutomationRules?.autoPrintRules) ?
                    {
                        storeId: order.storeId,
                        autoPrintRules: storeAutomationRules.autoPrintRules
                    }
                    :
                    undefined,
                locale
            );
            sendNotificationToStore(order.storeId, {
                orderId
            });
        }
    }

    return c.json({
        data: {
            order,
            stripeCheckoutSessionUrl,
            stripeError
        },
        error: null as ErrorType
    }, 200);
}