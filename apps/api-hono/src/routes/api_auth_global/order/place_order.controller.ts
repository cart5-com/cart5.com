import Stripe from "stripe";
import { type Context } from 'hono'
import { KNOWN_ERROR, type ErrorType } from '@lib/types/errors';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { generateOrderData_Service } from '@db/services/order.generate.service';
import { saveOrderDataTransactional_Service } from '@db/services/order.transactional.service';
import { generateKey } from '@lib/utils/generateKey';
import { generateCartId } from '@lib/utils/generateCartId';
import { updateUserData_Service } from '@db/services/user_data.service';
import { sendNotificationToStore } from '@api-hono/routes/api_orders/listen_store.controller';
import { getStoreAutomationRules_Service } from '@db/services/store.service';
import { createCheckoutSession_inStripeConnectedAccount } from '@api-hono/utils/stripe/createCheckoutSession_inStripeConnectedAccount';
import { STORE_FRONT_LINKS } from '@lib/storefrontLinks';
import { getLocaleFromAcceptLanguageHeader } from "@lib/utils/getLocaleFromAcceptLanguageHeader";
import { updateOrderStripeData_Service } from "@db/services/order.service";

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

    // if stripe return checkout url, make status 'PENDING_PAYMENT_AUTHORIZATION'
    let checkoutSession: Stripe.Checkout.Session | null = null;
    const IS_STRIPE_PAYMENT = order.paymentId === 'stripe';
    if (IS_STRIPE_PAYMENT) {
        if (!storeData?.stripeSettings?.stripeConnectAccountId) {
            throw new KNOWN_ERROR("Store not connected to stripe", "STORE_NOT_CONNECTED_TO_STRIPE");
        }
        if (!order.taxSettingsJSON?.currency) {
            throw new KNOWN_ERROR("Store currency not set", "STORE_CURRENCY_NOT_SET");
        }
        const domain = host.toLowerCase().replace('www.', '').substring(0, 10) || '';
        const storeName = storeData?.name?.substring(0, 10) || '';
        const orderIdShort = newOrderId.substring(4) || '';

        checkoutSession = await createCheckoutSession_inStripeConnectedAccount(
            `https://${host}${STORE_FRONT_LINKS.SHOW_ORDER(newOrderId)}#stripe-success`,
            `https://${host}${STORE_FRONT_LINKS.SHOW_ORDER(newOrderId)}#stripe-cancel`,
            newOrderId,
            user.email,
            order.userVerifiedPhoneNumbers,
            user.id,
            (order.cartBreakdownJSON?.applicationFeeWithTax),
            storeId,
            storeData?.stripeSettings?.stripeConnectAccountId,
            order.taxSettingsJSON?.currency,
            order.finalAmount,
            `${domain} ${storeName} #${orderIdShort}`,
            1,
            `${domain} ${storeName} #${orderIdShort}`,
            `${domain} ${storeName} #${orderIdShort}`
        )
        await updateOrderStripeData_Service(newOrderId, {
            storeStripeConnectAccountId: storeData?.stripeSettings?.stripeConnectAccountId,
            checkoutSessionId: checkoutSession.id,
            checkoutSessionStatus: checkoutSession.status,
        });
    }

    const locale = getLocaleFromAcceptLanguageHeader(c.req.header()['accept-language']);
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
            undefined,
        locale
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
            paymentSessionUrl: checkoutSession?.url ?? null
        },
        error: null as ErrorType
    }, 200);
}