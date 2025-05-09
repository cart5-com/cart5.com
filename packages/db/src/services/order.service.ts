import db from "@db/drizzle";
import { KNOWN_ERROR } from '@lib/types/errors';
import { orderTable, orderStatusHistoryTable } from "@db/schema/order.schema";
import type { User } from "@lib/types/UserType";
import { and, desc, eq, gte, inArray, ne } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";
import { getUserData_Service } from "./user_data.service";
import { getStoreData_CacheJSON } from "@db/cache_json/store.cache_json";
import { platformServiceFee } from "@lib/platformServiceFee";
import type { ServiceFee, CalculationType } from "@lib/zod/serviceFee";
import {
    calculateCartItemPrice,
    calculateCartTotalPrice
} from "@lib/utils/calculateCartItemPrice";

import { generateCartItemTextSummary } from "@lib/utils/generateCartItemTextSummary";
import {
    getSupportTeamWebsite_Service,
    getSupportTeamServiceFee_Service,
    getWebsiteByDefaultHostname,
    getWebsiteTeamServiceFee_Service
} from "@db/services/website.service";
import type { CartItem } from "@lib/zod/cartItemState";
import { calculateSubTotal } from "@lib/utils/calculateSubTotal";
import {
    calculateCartBreakdown
} from "@lib/utils/calculateCartBreakdown";
import { handleGeocode } from '@api-hono/routes/gmaps/mapsRoute.controller';
import { getAllVerifiedPhoneNumbers_Service } from '@db/services/phone.service';
import { checkUserDataBeforePlacingOrder, checkStoreDataBeforePlacingOrder, checkMinimumOrderValueForDelivery } from "@lib/utils/checkBeforePlacingOrder";
import { checkGeocodeDistance } from '@lib/utils/checkGeocodeDistance';
import type { OrderedItemsType } from "@lib/types/orderedItemsType";
import { estimatedTimeText } from "@lib/utils/estimatedTimeText";
import { ORDER_STATUS_OBJ, type OrderStatus } from "@lib/types/orderStatus";
import { getEnvVariable } from "@lib/utils/getEnvVariable";

export const logOrderStatusChange_Service = async ({
    orderId,
    newStatus,
    changedByUserId,
    changedByIpAddress,
    type,
    metaData
}: {
    orderId: string;
    newStatus: OrderStatus;
    changedByUserId?: string;
    changedByIpAddress?: string;
    type: 'user' | 'automatic_rule' | 'system';
    metaData?: Record<string, any>;
}) => {
    return await db.insert(orderStatusHistoryTable).values({
        orderId,
        newStatus,
        type: type ?? 'user',
        changedByUserId,
        changedByIpAddress,
        metaData: metaData ? JSON.stringify(metaData) : null
    });
}

export const getUserOrderData_Service = async (
    orderId: string,
    userId: string,
    columns?: Partial<Record<keyof typeof orderTable.$inferSelect, boolean>>
) => {
    return await db.query.orderTable.findFirst({
        where: and(eq(orderTable.orderId, orderId), eq(orderTable.userId, userId)),
        columns: columns,
    });
}

export const getOrderData_Service = async (
    orderId: string,
    columns?: Partial<Record<keyof typeof orderTable.$inferSelect, boolean>>
) => {
    return await db.query.orderTable.findFirst({
        where: eq(orderTable.orderId, orderId),
        columns: columns,
    });
}

export const getStoreOrders_Service = async (
    storeId: string,
    orderIds: string[],
    columns?: Partial<Record<keyof typeof orderTable.$inferSelect, boolean>>
) => {
    // TODO: is using inArray secure to prevent reading other store's orders?
    return await db.query.orderTable.findMany({
        where: and(eq(orderTable.storeId, storeId), inArray(orderTable.orderId, orderIds)),
        columns: columns,
    });
}

// TODO: sendNotificationToStore when status change?
export const acceptOrder_Service = async (
    storeId: string,
    orderId: string,
    changedByUserId?: string,
    changedByIpAddress?: string,
    type: 'user' | 'automatic_rule' | 'system' = 'user',
) => {
    const newStatus = ORDER_STATUS_OBJ.ACCEPTED;

    // Update order status
    const result = await db.update(orderTable).set({
        orderStatus: newStatus,
    })
        .where(
            and(
                eq(orderTable.orderId, orderId),
                eq(orderTable.storeId, storeId),
                eq(orderTable.orderStatus, ORDER_STATUS_OBJ.CREATED)
            )
        );

    // Log status change if update was successful
    if (result.rowsAffected > 0) {
        await logOrderStatusChange_Service({
            orderId,
            newStatus,
            changedByUserId,
            changedByIpAddress,
            type,
        });
    }

    return result;
}

export const completeOrder_Service = async (
    storeId: string,
    orderId: string,
    changedByUserId?: string,
    changedByIpAddress?: string,
    type: 'user' | 'automatic_rule' | 'system' = 'user',
) => {
    const newStatus = ORDER_STATUS_OBJ.COMPLETED;

    // Update order status
    const result = await db.update(orderTable).set({
        orderStatus: newStatus,
    })
        .where(
            and(
                eq(orderTable.orderId, orderId),
                eq(orderTable.storeId, storeId),
                eq(orderTable.orderStatus, ORDER_STATUS_OBJ.ACCEPTED)
            )
        );

    // Log status change if update was successful
    if (result.rowsAffected > 0) {
        await logOrderStatusChange_Service({
            orderId,
            newStatus,
            changedByUserId,
            changedByIpAddress,
            type,
        });
    }

    return result;
}

export const cancelOrder_Service = async (
    storeId: string,
    orderId: string,
    changedByUserId?: string,
    changedByIpAddress?: string,
    type: 'user' | 'automatic_rule' | 'system' = 'user',
) => {
    const newStatus = ORDER_STATUS_OBJ.CANCELLED;

    // Update order status
    const result = await db.update(orderTable).set({
        orderStatus: newStatus,
    }).where(
        and(
            eq(orderTable.orderId, orderId),
            eq(orderTable.storeId, storeId),
            ne(orderTable.orderStatus, ORDER_STATUS_OBJ.CANCELLED)
        )
    );

    // Log status change if update was successful
    if (result.rowsAffected > 0) {
        await logOrderStatusChange_Service({
            orderId,
            newStatus,
            changedByUserId,
            changedByIpAddress,
            type,
        });
    }

    return result;
}

export const updateOrderData_Service = async (
    orderId: string,
    data: Partial<InferInsertModel<typeof orderTable>>
) => {
    return await db.insert(orderTable)
        .values({ ...data, orderId } as InferInsertModel<typeof orderTable>)
        .onConflictDoUpdate({
            target: orderTable.orderId,
            set: data
        });
}

const RECENT_ORDERS_TIME_FRAME = 60 * 60 * 1000 * 24; // 24 hours
export const getRecentOrders_Service = async (
    storeId: string
) => {
    // last 6 hours
    const sixHoursAgo = new Date(Date.now() - RECENT_ORDERS_TIME_FRAME);
    // but status can not be PENDING_PAYMENT_AUTHORIZATION
    return await db.query.orderTable.findMany({
        columns: {
            orderId: true,
            created_at_ts: true,
            updated_at_ts: true,
        },
        where: and(
            eq(orderTable.storeId, storeId),
            gte(orderTable.created_at_ts, sixHoursAgo.getTime()),
            ne(orderTable.orderStatus, ORDER_STATUS_OBJ.PENDING_PAYMENT_AUTHORIZATION)
        ),
        orderBy: [desc(orderTable.created_at_ts)],
    });
}

export const generateOrderData_Service = async (
    user: User,
    host: string,
    storeId: string,
) => {
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
    const { currentCart, currentOrderType, deliveryAddress } = checkUserDataBeforePlacingOrder(userData, host, storeId);
    // check address location is close(300 meters) to geocoded address lat,lng
    if (currentOrderType === 'delivery' && deliveryAddress) {
        const url = 'https://' + getEnvVariable('PUBLIC_DOMAIN_NAME') + '/__p_api/gmaps/geocode?address=' + deliveryAddress.address1 + '&components=country:' + deliveryAddress.country
        const mapResult = await handleGeocode(url);
        checkGeocodeDistance(mapResult.data, {
            lat: deliveryAddress.lat!,
            lng: deliveryAddress.lng!
        });
    }
    const pickupNickname = (userData?.rememberLastNickname || user.name || 'unknown');
    const storeData = await getStoreData_CacheJSON(storeId);
    const { menuRoot, taxSettings, currentPaymentMethod } = checkStoreDataBeforePlacingOrder(storeData, currentOrderType, userData);
    const orderedItems: OrderedItemsType = [];
    // TODO: should I save cart state to have a reorder button?
    currentCart.items?.forEach((item: CartItem) => {
        const menuItem = menuRoot.allItems?.[item.itemId!];
        if (menuItem && menuItem.lbl) {
            const price = calculateCartItemPrice(item, menuRoot, taxSettings, userData?.rememberLastOrderType ?? 'delivery');
            if (price.isValid) {
                orderedItems.push({
                    name: menuItem.lbl ?? '',
                    quantity: item.quantity ?? 1,
                    details: generateCartItemTextSummary(item, menuRoot),
                    shownFee: (taxSettings.currencySymbol ?? '') + price.shownFee,
                });
            }
        }
    });
    if (orderedItems.length === 0) {
        throw new KNOWN_ERROR("Cart is empty", "CART_EMPTY");
    }


    const calculationType: CalculationType = storeData?.serviceFees?.calculationType ?? "INCLUDE";
    const tolerableServiceFeeRate = storeData?.serviceFees?.tolerableServiceFeeRate ?? 0;
    const offerDiscountIfPossible = storeData?.serviceFees?.offerDiscountIfPossible ?? true;
    const customServiceFees = storeData?.serviceFees?.customServiceFees ?? [];

    const cartTotals = calculateCartTotalPrice(currentCart, menuRoot ?? undefined, taxSettings, currentOrderType)
    // const subtotalShownFee = `${taxSettings.currencySymbol}${cartTotals.shownFee}`
    const storeLocation = {
        lat: storeData?.address?.lat ?? 0,
        lng: storeData?.address?.lng ?? 0
    }
    const subTotalWithDeliveryAndServiceFees = calculateSubTotal(
        currentCart, menuRoot ?? undefined, taxSettings, currentOrderType,
        {
            lat: deliveryAddress?.lat ?? userData?.rememberLastLat!,
            lng: deliveryAddress?.lng ?? userData?.rememberLastLng!
        },
        storeData?.deliveryZones?.zones ?? [],
        storeLocation,
        customServiceFees
    );

    checkMinimumOrderValueForDelivery(
        subTotalWithDeliveryAndServiceFees,
        taxSettings,
        currentOrderType,
        cartTotals
    );
    // ALL CHECKS UNTIL HERE ARE ALSO CHECKING IN CLIENTSIDE (CartContainer.vue)


    const WEBSITE = await getWebsiteByDefaultHostname(host ?? '');
    if (!WEBSITE || !WEBSITE.id || !WEBSITE.defaultHostname) {
        throw new KNOWN_ERROR("Website not found", "WEBSITE_NOT_FOUND");
    }
    const websiteTeamServiceFee = await getWebsiteTeamServiceFee_Service(
        WEBSITE?.id ?? "",
        storeId,
        WEBSITE?.defaultMarketplaceFee ?? null
    )
    const supportTeamServiceFee = await getSupportTeamServiceFee_Service(storeId);
    const supportPartnerServiceFee: ServiceFee | null = supportTeamServiceFee;
    const marketingPartnerServiceFee: ServiceFee | null = websiteTeamServiceFee;

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

    const userVerifiedPhoneNumbers = await getAllVerifiedPhoneNumbers_Service(user.id);
    const supportTeamWebsite = await getSupportTeamWebsite_Service(storeId);
    const subtotalJSON = subTotalWithDeliveryAndServiceFees;
    // TODO: I also need to save the estimated time settings, text is not enough
    const estimatedTime = estimatedTimeText(
        currentOrderType,
        subTotalWithDeliveryAndServiceFees.bestDeliveryZone?.customEstimatedDeliveryTime,
        storeData?.defaultEstimatedDeliveryTime ?? undefined,
        storeData?.defaultEstimatedPickupTime ?? undefined
    )
    return {
        order: {
            userId: user.id,
            userEmail: user.email,
            userVerifiedPhoneNumbers: userVerifiedPhoneNumbers.map(phone => phone.phoneNumber).join('|'),
            userName: user.name,
            websiteId: WEBSITE.id,
            websiteDefaultHostname: WEBSITE.defaultHostname,
            supportTeamWebsiteId: supportTeamWebsite?.id,
            supportTeamWebsiteDefaultHostname: supportTeamWebsite?.defaultHostname,
            storeId,
            orderType: currentOrderType,
            pickupNickname,
            storeLocationLat: storeLocation.lat,
            storeLocationLng: storeLocation.lng,
            storeName: storeData?.name,
            storeAddress1: storeData?.address?.address1 ?? '',
            paymentId: userData?.rememberLastPaymentMethodId ?? '',
            isOnlinePayment: currentPaymentMethod.isOnline,
            orderNote: currentCart.orderNote,
            finalAmount: cartBreakdown.buyerPays,
            estimatedTimeText: estimatedTime,
            // JSONs
            paymentMethodJSON: currentPaymentMethod,
            orderedItemsJSON: orderedItems,
            cartTotalsJSON: cartTotals,
            subtotalJSON,
            cartBreakdownJSON: cartBreakdown,
            deliveryAddressJSON: deliveryAddress,
            taxSettingsJSON: taxSettings,
        },
        carts: userData?.carts
    }
}