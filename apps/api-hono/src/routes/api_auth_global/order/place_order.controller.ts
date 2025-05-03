import { type Context } from 'hono'
import { KNOWN_ERROR, type ErrorType } from '@lib/types/errors';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { getUserData_Service } from "@db/services/user_data.service";
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
    const origin = c.req.header()['origin'];
    if (!origin) {
        throw new KNOWN_ERROR("Origin not found", "ORIGIN_NOT_FOUND");
    }
    const user = c.get("USER");
    if (!user || !user.id) {
        throw new KNOWN_ERROR("User not found", "USER_NOT_FOUND");
    }
    if (user.hasVerifiedPhoneNumber === 0) {
        throw new KNOWN_ERROR("User phone number not verified", "USER_PHONE_NUMBER_NOT_VERIFIED");
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
    const { currentCart, currentOrderType, deliveryAddress } = checkUserDataBeforePlacingOrder(userData, host, storeId);
    // check address location is close(300 meters) to geocoded address lat,lng
    if (currentOrderType === 'delivery' && deliveryAddress) {
        const mapResult = await handleGeocode(origin + '/__p_api/gmaps/geocode?address=' + deliveryAddress.address1 + '&components=country:' + deliveryAddress.country);
        checkGeocodeDistance(mapResult.data, {
            lat: deliveryAddress.lat!,
            lng: deliveryAddress.lng!
        });
    }
    const pickupNickname = (userData?.rememberLastNickname || user.name || 'unknown');
    const storeData = await getStoreData_CacheJSON(storeId);
    const { menuRoot, taxSettings, currentPaymentMethod } = checkStoreDataBeforePlacingOrder(storeData, currentOrderType, userData);
    const orderedItems: {
        name: string;
        quantity: number;
        details: string;
        shownFee: string;
    }[] = [];
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
        lat: storeData?.address?.lat!,
        lng: storeData?.address?.lng!
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
    if (!WEBSITE || !WEBSITE.id) {
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
    const subtotalJson = {
        ...subTotalWithDeliveryAndServiceFees,
        bestDeliveryZone: subTotalWithDeliveryAndServiceFees.bestDeliveryZone ?
            {
                itemTotal: subTotalWithDeliveryAndServiceFees.bestDeliveryZone.itemTotal,
                tax: subTotalWithDeliveryAndServiceFees.bestDeliveryZone.tax,
                totalWithTax: subTotalWithDeliveryAndServiceFees.bestDeliveryZone.totalWithTax,
                shownFee: subTotalWithDeliveryAndServiceFees.bestDeliveryZone.shownFee,
                distanceFromStoreKm: subTotalWithDeliveryAndServiceFees.bestDeliveryZone.distanceFromStoreKm,
                totalDeliveryFee: subTotalWithDeliveryAndServiceFees.bestDeliveryZone.totalDeliveryFee,
            }
            : undefined
    };

    const result = {
        userId: user.id,
        userVerifiedPhoneNumber: userVerifiedPhoneNumbers.map(phone => phone.phoneNumber).join('|'),
        websiteId: WEBSITE.id,
        websiteDefaultHostname: WEBSITE.defaultHostname,
        supportTeamWebsiteId: supportTeamWebsite?.id,
        supportTeamWebsiteDefaultHostname: supportTeamWebsite?.defaultHostname,
        storeId,
        orderType: currentOrderType,
        orderedItemsJson: orderedItems,
        subtotalJson,
        cartBreakdownJson: cartBreakdown,
        deliveryAddress,
        pickupNickname,
        storeLocation,
        storeName: storeData?.name,
        storeAddress1: storeData?.address?.address1,
        currentPaymentMethod,
        paymentId: userData?.rememberLastPaymentMethodId,
        orderNote: currentCart.orderNote,
        finalAmount: cartBreakdown.buyerPays,
    }

    return c.json({
        data: result,
        error: null as ErrorType
    }, 200);
}



