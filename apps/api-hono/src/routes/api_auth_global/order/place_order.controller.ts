import Stripe from "stripe";
import { type Context } from 'hono'
import { KNOWN_ERROR, type ErrorType } from '@lib/types/errors';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { generateOrderData_Service } from '@db/services/order.service';
import { saveOrderDataTransactional_Service } from '@db/services/order.transactional.service';
import { generateKey } from '@lib/utils/generateKey';
import { generateCartId } from '@lib/utils/generateCartId';
import { updateUserData_Service } from '@db/services/user_data.service';
import { sendNotificationToStore } from '@api-hono/routes/api_orders/listen_store.controller';
import { getStoreAutomationRules_Service, getStoreStripeConnectSettings_Service } from '@db/services/store.service';
import { createPaymentSession } from '@api-hono/utils/stripe';
import { STORE_FRONT_LINKS } from '@lib/storefrontLinks';

export const placeOrderRoute = async (c: Context<
    HonoVariables
>) => {
    const storeId = c.req.param('storeId');
    if (!storeId) {
        throw new KNOWN_ERROR("Store ID not found", "STORE_ID_NOT_FOUND");
    }
    const host = c.req.header()['host'];
    if (!host) {
        throw new KNOWN_ERROR("Host not found", "HOST_NOT_FOUND");
    }
    const user = c.get("USER");
    if (!user || !user.id) {
        throw new KNOWN_ERROR("User not found", "USER_NOT_FOUND");
    }
    if (user.hasVerifiedPhoneNumber === 0) {
        throw new KNOWN_ERROR("User phone number not verified", "USER_PHONE_NUMBER_NOT_VERIFIED");
    }
    const newOrderId = generateKey('ord');
    const { order, carts, storeData } = await generateOrderData_Service(user, host, storeId);
    // order.orderStatus is CREATED (or PENDING_PAYMENT_AUTHORIZATION for stripe)

    const ipAddress = c.req.header()['x-forwarded-for'] || c.req.header()['x-real-ip'];
    // Get store automation rules
    const storeAutomationRules = await getStoreAutomationRules_Service(storeId, {
        autoAcceptOrders: true,
        autoPrintRules: true
    });

    // TODO: if stripe return checkout url, make status 'PENDING_PAYMENT_AUTHORIZATION'
    let paymentSession: Stripe.Checkout.Session | null = null;
    const IS_STRIPE_PAYMENT = order.paymentId === 'stripe';
    if (IS_STRIPE_PAYMENT) {
        const stripeConnectAccountId = (await getStoreStripeConnectSettings_Service(storeId, {
            stripeConnectAccountId: true
        }))?.stripeConnectAccountId;
        if (!stripeConnectAccountId) {
            throw new KNOWN_ERROR("Store not connected to stripe", "STORE_NOT_CONNECTED_TO_STRIPE");
        }
        if (!order.taxSettingsJSON?.currency) {
            throw new KNOWN_ERROR("User phone number not verified", "USER_PHONE_NUMBER_NOT_VERIFIED");
        }
        paymentSession = await createPaymentSession(
            `https://${host}${STORE_FRONT_LINKS.SHOW_ORDER(newOrderId)}#stripe-success`,
            `https://${host}${STORE_FRONT_LINKS.SHOW_ORDER(newOrderId)}#stripe-cancel`,
            newOrderId,
            user.email,
            order.userVerifiedPhoneNumbers,
            user.id,
            (order.cartBreakdownJSON?.applicationFeeWithTax),
            storeId,
            stripeConnectAccountId,
            order.taxSettingsJSON?.currency,
            order.finalAmount,
            `${host.toLowerCase().replace('www.', '')} ${storeData?.name} #${newOrderId}`,
            1,
            `${host.toLowerCase().replace('www.', '')} ${storeData?.name} #${newOrderId}`,
            `${host.toLowerCase().replace('www.', '')} ${storeData?.name} #${newOrderId}`
        )
        order.paymentMethodJSON.paymentReferenceId = paymentSession.id;
    }


    await saveOrderDataTransactional_Service(
        newOrderId,
        order,
        {
            newStatus: order.orderStatus,
            changedByUserId: user.id,
            changedByIpAddress: ipAddress,
            type: 'user',
        },
        (!IS_STRIPE_PAYMENT && storeAutomationRules?.autoAcceptOrders) ?
            {
                storeId,
                changedByUserId: undefined,
                changedByIpAddress: undefined,
                type: 'automatic_rule'
            }
            :
            undefined,
        (!IS_STRIPE_PAYMENT && storeAutomationRules?.autoPrintRules) ?
            {
                storeId,
                autoPrintRules: storeAutomationRules.autoPrintRules
            }
            :
            undefined
    );

    // delete cart current cart
    const cartId = generateCartId(host ?? '', storeId);
    delete carts?.[cartId];
    await updateUserData_Service(user.id, { carts });


    if (!IS_STRIPE_PAYMENT) {
        sendNotificationToStore(storeId, {
            orderId: newOrderId
        });
    }

    // TODO: send email notification to user once store approves/rejects order
    return c.json({
        data: {
            newOrderId,
            paymentSessionUrl: paymentSession?.url ?? null
        },
        error: null as ErrorType
    }, 200);
}