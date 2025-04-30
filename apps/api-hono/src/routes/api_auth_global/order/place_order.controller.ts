import { type Context } from 'hono'
import { KNOWN_ERROR, type ErrorType } from '@lib/types/errors';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { getUserData_Service } from "@db/services/user_data.service";
import { getStoreData_CacheJSON } from "@db/cache_json/store.cache_json";
// import type { ResType } from "@api-client/typeUtils";
// import { authGlobalApiClient } from "@api-client/auth_global";
// import { zValidator } from "@hono/zod-validator";
// import { z } from "zod";
// import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import { platformServiceFee } from "@lib/platformServiceFee";
import type { ServiceFee, CalculationType } from "@lib/zod/serviceFee";
import {
    calculateCartItemPrice,
    calculateCartTotalPrice
} from "@lib/utils/calculateCartItemPrice";
import type { TaxSettings } from "@lib/zod/taxSchema";
import { generateCartItemTextSummary } from "@lib/utils/generateCartItemTextSummary";
import {
    getSupportTeamServiceFee_Service,
    getWebsiteByDefaultHostname,
    getWebsiteTeamServiceFee_Service
} from "@db/services/website.service";
import { generateCartId } from "@lib/utils/generateCartId";
import type { CartItem } from "@lib/zod/cartItemState";
import { calculateSubTotal } from "@lib/utils/calculateSubTotal";
import {
    calculateCartBreakdown
} from "@lib/utils/calculateCartBreakdown";
import { isStoreOpenNow } from '@lib/utils/isOpenNow';

// type UserDataStoreType = ResType<typeof authGlobalApiClient.get_user_data.$post>["data"];
// export const placeOrder_SchemaValidator = zValidator('json', z.object({
//     storeId: z.string(),
// }));

export const placeOrderRoute = async (c: Context<
    HonoVariables
// '/:storeId/place_order',
// ValidatorContext<typeof placeOrder_SchemaValidator>
>) => {
    const host = c.req.header()['host'];
    const user = c.get("USER");
    if (!user || !user.id) {
        throw new KNOWN_ERROR("User not found", "USER_NOT_FOUND");
    }
    const storeId = c.req.param('storeId');
    if (!storeId) {
        throw new KNOWN_ERROR("Store ID not found", "STORE_ID_NOT_FOUND");
    }
    const userData = await getUserData_Service(user.id, {
        rememberLastAddress: true,
        rememberLastCountry: true,
        rememberLastLat: true,
        rememberLastLng: true,
        rememberLastPaymentMethodId: true,
        rememberLastOrderType: true,
        rememberLastNickname: true,
        rememberLastAddressId: true,
        addresses: true,
        carts: true,
    });
    if (!userData) {
        throw new KNOWN_ERROR("User data not found", "USER_DATA_NOT_FOUND");
    }
    if (!userData.rememberLastOrderType) {
        throw new KNOWN_ERROR("Order type not found", "ORDER_TYPE_NOT_FOUND");
    }
    const currentCart = userData.carts?.[generateCartId(host ?? '', storeId)];
    if (!currentCart) {
        throw new KNOWN_ERROR("Cart not found", "CART_NOT_FOUND");
    }
    if (!currentCart.items) {
        throw new KNOWN_ERROR("Cart is empty", "CART_EMPTY");
    }
    const storeData = await getStoreData_CacheJSON(storeId);
    if (!storeData) {
        throw new KNOWN_ERROR("Store data not found", "STORE_DATA_NOT_FOUND");
    }
    if (
        userData.rememberLastOrderType === 'pickup' && !storeData.offersPickup
    ) {
        throw new KNOWN_ERROR("Store does not offer pickup", "STORE_DOES_NOT_OFFER_PICKUP");
    }
    if (
        userData.rememberLastOrderType === 'delivery' && !storeData.offersDelivery
    ) {
        throw new KNOWN_ERROR("Store does not offer delivery", "STORE_DOES_NOT_OFFER_DELIVERY");
    }
    const currentOrderType = userData.rememberLastOrderType;
    const isStoreOpen = isStoreOpenNow(currentOrderType, storeData?.openHours ?? null);
    if (
        !isStoreOpen
        // TODO: What about scheduled orders? we do not have scheduled orders yet. maybe later
    ) {
        throw new KNOWN_ERROR("Store is not open", "STORE_IS_NOT_OPEN");
    }

    const deliveryAddress = currentOrderType === 'delivery' && userData.rememberLastAddressId && userData.addresses ?
        userData.addresses[userData.rememberLastAddressId] : undefined;

    const pickupNickname = currentOrderType === 'pickup' ?
        (userData.rememberLastNickname || user.name || undefined) : 'undefined';

    if (currentOrderType === 'delivery' && !deliveryAddress) {
        throw new KNOWN_ERROR("Delivery address not found", "DELIVERY_ADDRESS_NOT_FOUND");
    }

    const taxSettings = storeData?.taxSettings as TaxSettings;
    if (!taxSettings) {
        throw new KNOWN_ERROR("Tax settings not found", "TAX_SETTINGS_NOT_FOUND");
    }
    const menuRoot = storeData?.menu?.menuRoot;
    if (!menuRoot) {
        throw new KNOWN_ERROR("Menu root not found", "MENU_ROOT_NOT_FOUND");
    }

    const WEBSITE = await getWebsiteByDefaultHostname(host ?? '');
    if (!WEBSITE || !WEBSITE.id) {
        throw new KNOWN_ERROR("Website not found", "WEBSITE_NOT_FOUND");
    }

    if (!userData.rememberLastPaymentMethodId) {
        throw new KNOWN_ERROR("Payment method not selected", "PAYMENT_METHOD_NOT_SELECTED");
    }

    // Validate that the selected payment method is available for the current order type
    const paymentMethods = currentOrderType === 'delivery'
        ? (storeData.paymentMethods?.deliveryPaymentMethods?.isActive
            ? storeData.paymentMethods.deliveryPaymentMethods
            : storeData.paymentMethods?.defaultPaymentMethods)
        : (storeData.paymentMethods?.pickupPaymentMethods?.isActive
            ? storeData.paymentMethods.pickupPaymentMethods
            : storeData.paymentMethods?.defaultPaymentMethods);

    if (!paymentMethods) {
        throw new KNOWN_ERROR("Payment methods not configured for store", "PAYMENT_METHODS_NOT_CONFIGURED");
    }

    // Check if the selected payment method is valid
    let isValidPaymentMethod = false;

    if (userData.rememberLastPaymentMethodId === 'stripe' && storeData?.stripeSettings?.isStripeEnabled) {
        isValidPaymentMethod = true;
    } else if (userData.rememberLastPaymentMethodId === 'cash' && paymentMethods.cash) {
        isValidPaymentMethod = true;
    } else if (userData.rememberLastPaymentMethodId === 'cardTerminal' && paymentMethods.cardTerminal) {
        isValidPaymentMethod = true;
    } else if (paymentMethods.customMethods) {
        isValidPaymentMethod = paymentMethods.customMethods.some(
            method => method.id === userData.rememberLastPaymentMethodId && method.isActive
        );
    }

    if (!isValidPaymentMethod) {
        throw new KNOWN_ERROR("Selected payment method is not available", "INVALID_PAYMENT_METHOD");
    }

    // Ensure Stripe customer has a chargeable payment method if needed
    if (userData.rememberLastPaymentMethodId !== 'stripe' &&
        !storeData?.asStripeCustomer?.hasChargablePaymentMethod) {
        throw new KNOWN_ERROR("Store does not support selected payment method", "STORE_DOES_NOT_SUPPORT_PAYMENT_METHOD");
    }

    const websiteTeamServiceFee = await getWebsiteTeamServiceFee_Service(
        WEBSITE?.id ?? "",
        storeId,
        WEBSITE?.defaultMarketplaceFee ?? null
    )
    const supportTeamServiceFee = await getSupportTeamServiceFee_Service(storeId);
    const supportPartnerServiceFee: ServiceFee | null = supportTeamServiceFee;
    const marketingPartnerServiceFee: ServiceFee | null = websiteTeamServiceFee;

    const orderedItems: {
        name: string;
        quantity: number;
        details: string;
        shownFee: string;
    }[] = [];

    currentCart.items.forEach((item: CartItem) => {
        const menuItem = menuRoot.allItems?.[item.itemId!];
        if (menuItem && menuItem.lbl) {
            const price = calculateCartItemPrice(item, menuRoot, taxSettings, userData.rememberLastOrderType ?? 'delivery');
            orderedItems.push({
                name: menuItem.lbl ?? '',
                quantity: item.quantity ?? 1,
                details: generateCartItemTextSummary(item, menuRoot),
                shownFee: (taxSettings.currencySymbol ?? '') + price.shownFee,
            });
        }
    });
    const calculationType: CalculationType = storeData?.serviceFees?.calculationType ?? "INCLUDE";
    const tolerableServiceFeeRate = storeData?.serviceFees?.tolerableServiceFeeRate ?? 0;
    const offerDiscountIfPossible = storeData?.serviceFees?.offerDiscountIfPossible ?? true;
    const customServiceFees = storeData.serviceFees?.customServiceFees ?? [];

    // TODO: check distance between user address lat,lng and geocoded address lat,lng
    // if it is more than 300 meters, then ignore user lat,lng and use geocoded address lat,lng
    const cartTotals = calculateCartTotalPrice(currentCart, menuRoot ?? undefined, taxSettings, currentOrderType)
    if (currentOrderType === 'delivery' && cartTotals.shownFee < (storeData.deliveryZones?.zones?.[0]?.minCart ?? 0)) {
        throw new KNOWN_ERROR(`Cart subtotal is less than minimum cart value: ${taxSettings.currencySymbol}${storeData.deliveryZones?.zones?.[0]?.minCart}`, "CART_SUBTOTAL_LESS_THAN_MINIMUM_CART_VALUE");
    }
    const subtotalShownFee = `${taxSettings.currencySymbol}${cartTotals.shownFee}`
    const subTotalWithDeliveryAndServiceFees = calculateSubTotal(
        currentCart, menuRoot ?? undefined, taxSettings, currentOrderType,
        {
            lat: userData.rememberLastLat!,
            lng: userData.rememberLastLng!
        },
        storeData.deliveryZones?.zones ?? [],
        {
            lat: storeData.address?.lat!,
            lng: storeData.address?.lng!
        },
        customServiceFees
    );

    const cartBreakdown = calculateCartBreakdown(
        subTotalWithDeliveryAndServiceFees,
        platformServiceFee,
        supportPartnerServiceFee,
        marketingPartnerServiceFee,
        taxSettings,
        calculationType,
        tolerableServiceFeeRate,
        offerDiscountIfPossible,
        userData?.rememberLastPaymentMethodId === "stripe" && (storeData?.stripeSettings?.isStripeEnabled ?? false),
        {
            name: "Stripe Fee",
            ratePerOrder: storeData?.stripeSettings?.stripeRatePerOrder ?? 0,
            feePerOrder: storeData?.stripeSettings?.stripeFeePerOrder ?? 0,
            whoPaysFee: storeData?.stripeSettings?.whoPaysStripeFee ?? "STORE"
        }
    )



    const result = {
        storeId,
        orderType: currentOrderType,
        userId: user.id,
        orderedItems,
        subtotalShownFee,
        subtotalDetails: subTotalWithDeliveryAndServiceFees,
        cartBreakdown,
        finalAmount: cartBreakdown.buyerPays,
        orderNote: currentCart.orderNote,
        paymentId: userData?.rememberLastPaymentMethodId,
        paymentDetails: {
            isStripeEnabled: storeData?.stripeSettings?.isStripeEnabled ?? false,
            hasChargablePaymentMethod: storeData?.asStripeCustomer?.hasChargablePaymentMethod ?? false,
            paymentMethods: storeData?.paymentMethods,
            selectedPaymentMethodName: userData?.rememberLastPaymentMethodId === 'stripe' ? 'Pay online' :
                userData?.rememberLastPaymentMethodId === 'cash' ? 'Cash' :
                    userData?.rememberLastPaymentMethodId === 'cardTerminal' ? 'Card' :
                        storeData?.paymentMethods?.defaultPaymentMethods?.customMethods?.find(
                            m => m.id === userData?.rememberLastPaymentMethodId
                        )?.name ?? 'Unknown payment method'
        },
        storeName: storeData?.name,
        storeAddress1: storeData?.address?.address1,
        deliveryAddress,
        pickupNickname,
    }

    return c.json({
        data: result,
        error: null as ErrorType
    }, 200);
}



